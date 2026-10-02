#!/usr/bin/env python3
"""Gera os dados do portfólio a partir da API pública do GitHub.

Lê `portfolio.config.json`, busca o perfil, os repositórios próprios e as
contribuições em repositórios de terceiros, escolhe os projetos mais
relevantes e grava tudo em `public/data/github.json`, que o site React lê.

Uso:
    python scripts/fetch_github_data.py            # usa GITHUB_TOKEN se existir
    python scripts/fetch_github_data.py --sample   # copia dados de exemplo (offline)

Só usa a biblioteca padrão do Python, então não precisa de `pip install`.
"""

from __future__ import annotations

import argparse
import base64
import json
import math
import os
import re
import shutil
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "portfolio.config.json"
OUTPUT_PATH = ROOT / "public" / "data" / "github.json"
SAMPLE_PATH = Path(__file__).resolve().parent / "sample_data.json"

API = "https://api.github.com"
MAX_LANGUAGE_CALLS = 40
TOP_LANGUAGES = 8


# --------------------------------------------------------------------------- #
# Cliente HTTP
# --------------------------------------------------------------------------- #
class GitHub:
    def __init__(self, token: str | None) -> None:
        self.token = token

    def _request(self, url: str, data: bytes | None = None) -> Any:
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "portfolio-data-script",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        if data is not None:
            headers["Content-Type"] = "application/json"
        req = urllib.request.Request(url, data=data, headers=headers)
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=30) as resp:
                    return json.loads(resp.read().decode("utf-8"))
            except urllib.error.HTTPError as err:
                # 403/429 de rate limit secundário: espera um pouco e tenta de novo.
                if err.code in (403, 429) and attempt < 2:
                    time.sleep(5 * (attempt + 1))
                    continue
                raise
        raise RuntimeError("unreachable")

    def get(self, path: str, **params: Any) -> Any:
        query = f"?{urllib.parse.urlencode(params)}" if params else ""
        return self._request(f"{API}{path}{query}")

    def paginate(self, path: str, limit: int = 1000, **params: Any) -> list[Any]:
        items: list[Any] = []
        page = 1
        while len(items) < limit:
            batch = self.get(path, per_page=100, page=page, **params)
            if isinstance(batch, dict):  # endpoints de busca
                batch = batch.get("items", [])
            if not batch:
                break
            items.extend(batch)
            if len(batch) < 100:
                break
            page += 1
        return items[:limit]

    def graphql(self, query: str, **variables: Any) -> Any:
        body = json.dumps({"query": query, "variables": variables}).encode()
        result = self._request(f"{API}/graphql", data=body)
        if result.get("errors"):
            raise RuntimeError(result["errors"])
        return result["data"]


# --------------------------------------------------------------------------- #
# Regras de relevância (funções puras, cobertas por testes)
# --------------------------------------------------------------------------- #
def _parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def score_repo(repo: dict[str, Any], now: datetime) -> float:
    """Pontua um repositório próprio: quanto maior, mais relevante."""
    score = 0.0
    score += repo.get("stargazers_count", 0) * 4
    score += repo.get("forks_count", 0) * 3
    if repo.get("description"):
        score += 10
    if repo.get("homepage"):
        score += 8
    score += min(len(repo.get("topics") or []), 5) * 2
    if repo.get("language"):
        score += 3
    # Projetos com mais código tendem a ser mais substanciais (escala log).
    score += min(math.log10(repo.get("size", 0) + 1) * 3, 12)
    pushed = _parse_date(repo.get("pushed_at"))
    if pushed:
        months = (now - pushed).days / 30
        score += max(0.0, 20 - months)
    if repo.get("archived"):
        score -= 15
    return round(score, 2)


def select_projects(
    repos: list[dict[str, Any]], config: dict[str, Any], user: str, now: datetime
) -> list[dict[str, Any]]:
    """Escolhe os projetos próprios que aparecem no site."""
    opts = config.get("projects", {})
    hidden = {name.lower() for name in opts.get("hidden", [])}
    featured = [name.lower() for name in opts.get("featured", [])]
    include_forks = opts.get("includeForks", False)
    limit = opts.get("max", 12)

    candidates = []
    for repo in repos:
        name = repo["name"].lower()
        if name in hidden or name == user.lower():  # README de perfil não é projeto
            continue
        if repo.get("fork") and not include_forks and name not in featured:
            continue
        if repo.get("private"):
            continue
        if not repo.get("language") and name not in featured:  # repositório sem código
            continue
        candidates.append({**repo, "_score": score_repo(repo, now)})

    def order(repo: dict[str, Any]) -> tuple[int, float]:
        name = repo["name"].lower()
        rank = featured.index(name) if name in featured else len(featured)
        return (rank, -repo["_score"])

    candidates.sort(key=order)
    return candidates[:limit]


def group_contributions(
    prs: list[dict[str, Any]], commits: list[dict[str, Any]], user: str
) -> dict[str, dict[str, Any]]:
    """Agrupa PRs e commits por repositório de terceiros."""
    grouped: dict[str, dict[str, Any]] = {}

    def entry(full_name: str) -> dict[str, Any]:
        return grouped.setdefault(
            full_name, {"fullName": full_name, "pullRequests": 0, "mergedPullRequests": 0, "commits": 0}
        )

    for pr in prs:
        full_name = "/".join(pr["repository_url"].split("/")[-2:])
        if full_name.split("/")[0].lower() == user.lower():
            continue
        item = entry(full_name)
        item["pullRequests"] += 1
        if (pr.get("pull_request") or {}).get("merged_at"):
            item["mergedPullRequests"] += 1

    for commit in commits:
        full_name = commit["repository"]["full_name"]
        if full_name.split("/")[0].lower() == user.lower():
            continue
        entry(full_name)["commits"] += 1

    return grouped


def contribution_score(item: dict[str, Any]) -> float:
    return (
        item["mergedPullRequests"] * 5
        + item["pullRequests"] * 2
        + min(item["commits"], 50)
        + math.log10(item.get("stars", 0) + 1) * 4
    )


# Trechos de READMEs gerados por templates, que não descrevem o projeto.
BOILERPLATE = (
    "bootstrapped with",
    "this template provides",
    "create react app",
    "create-next-app",
    "create-expo-app",
    "this is an [expo]",
    "this is a new [**react native**]",
    "getting started",
    "run the development server",
    "npm run dev",
    "localhost:",
)


def readme_summary(markdown: str, limit: int = 200) -> str:
    """Extrai o primeiro parágrafo de texto de um README para usar como descrição."""
    text = re.sub(r"<!--.*?-->", "", markdown, flags=re.S)
    text = re.sub(r"```.*?```", "", text, flags=re.S)
    paragraphs: list[str] = []
    current: list[str] = []
    for raw in text.splitlines() + [""]:
        line = raw.strip()
        skip = line.startswith(("#", "!", "[!", "<", "|", "---", "===", ">", "- ", "* ", "+ "))
        if not line or skip:
            if current:
                paragraphs.append(" ".join(current))
                current = []
            continue
        current.append(line)

    for paragraph in paragraphs:
        clean = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", paragraph)  # imagens
        clean = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", clean)  # links -> texto
        clean = re.sub(r"<[^>]+>", "", clean)
        clean = re.sub(r"[*_`]{1,3}", "", clean).strip()
        # Parágrafos que terminam em ":" costumam só apresentar um bloco de código.
        if len(clean) < 30 or clean.endswith(":") or any(marker in clean.lower() for marker in BOILERPLATE):
            continue
        if len(clean) > limit:
            clean = clean[:limit].rsplit(" ", 1)[0].rstrip(",.;:") + "…"
        return clean
    return ""


def language_breakdown(totals: Counter[str] | dict[str, int], limit: int = TOP_LANGUAGES) -> list[dict[str, Any]]:
    """Percentual das `limit` linguagens principais; o restante vira "Other"."""
    totals = Counter(totals)
    total = sum(totals.values())
    if not total:
        return []
    top = totals.most_common(limit)
    result = [{"name": name, "percent": round(value * 100 / total, 1)} for name, value in top]
    rest = total - sum(value for _, value in top)
    if rest > 0:
        result.append({"name": "Other", "percent": round(rest * 100 / total, 1)})
    return result


# --------------------------------------------------------------------------- #
# Coleta
# --------------------------------------------------------------------------- #
def project_payload(repo: dict[str, Any], languages: dict[str, int]) -> dict[str, Any]:
    return {
        "name": repo["name"],
        "fullName": repo["full_name"],
        "description": repo.get("description") or "",
        "url": repo["html_url"],
        "homepage": repo.get("homepage") or "",
        "language": repo.get("language") or "",
        "languages": language_breakdown(languages, limit=5),
        "topics": repo.get("topics") or [],
        "stars": repo.get("stargazers_count", 0),
        "forks": repo.get("forks_count", 0),
        "isFork": bool(repo.get("fork")),
        "isArchived": bool(repo.get("archived")),
        "createdAt": repo.get("created_at"),
        "pushedAt": repo.get("pushed_at"),
    }


def fetch_readme_summary(gh: GitHub, full_name: str) -> str:
    try:
        data = gh.get(f"/repos/{full_name}/readme")
        return readme_summary(base64.b64decode(data.get("content", "")).decode("utf-8", "replace"))
    except (urllib.error.HTTPError, ValueError):
        return ""


CONTRIBUTED_QUERY = """
query($login: String!) {
  user(login: $login) {
    repositoriesContributedTo(
      first: 50, privacy: PUBLIC, includeUserRepositories: false,
      contributionTypes: [COMMIT, PULL_REQUEST, PULL_REQUEST_REVIEW]
    ) { nodes { nameWithOwner } }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}
"""


def collect(gh: GitHub, config: dict[str, Any]) -> dict[str, Any]:
    user = config["githubUser"]
    now = datetime.now(timezone.utc)

    print(f"→ Perfil de {user}")
    profile = gh.get(f"/users/{user}")

    print("→ Repositórios próprios")
    repos = gh.paginate(f"/users/{user}/repos", type="owner", sort="pushed")
    own = [r for r in repos if not r.get("fork") and not r.get("private")]

    print("→ Linguagens")
    language_cache: dict[str, dict[str, int]] = {}
    totals: Counter[str] = Counter()
    for repo in sorted(own, key=lambda r: r.get("pushed_at") or "", reverse=True)[:MAX_LANGUAGE_CALLS]:
        try:
            langs = gh.get(f"/repos/{repo['full_name']}/languages")
        except urllib.error.HTTPError:
            langs = {}
        language_cache[repo["full_name"]] = langs
        totals.update(langs)
    if not totals:  # sem chamadas extras: usa a linguagem principal de cada repo
        totals.update(r["language"] for r in own if r.get("language"))

    selected = select_projects(repos, config, user, now)
    projects = []
    for repo in selected:
        langs = language_cache.get(repo["full_name"])
        if langs is None:
            try:
                langs = gh.get(f"/repos/{repo['full_name']}/languages")
            except urllib.error.HTTPError:
                langs = {}
        payload = project_payload(repo, langs)
        if not payload["description"]:
            payload["description"] = fetch_readme_summary(gh, repo["full_name"])
        projects.append(payload)

    print("→ Contribuições em outros repositórios")
    # Se uma dessas buscas falhar, o script falha também: melhor manter o site
    # publicado do que substituí-lo por um sem as contribuições.
    prs = gh.paginate("/search/issues", limit=300, q=f"author:{user} type:pr -user:{user}")
    commits = gh.paginate("/search/commits", limit=300, q=f"author:{user} -user:{user}")
    grouped = group_contributions(prs, commits, user)

    calendar = None
    if gh.token:
        try:
            data = gh.graphql(CONTRIBUTED_QUERY, login=user)["user"]
            for node in data["repositoriesContributedTo"]["nodes"]:
                grouped.setdefault(
                    node["nameWithOwner"],
                    {"fullName": node["nameWithOwner"], "pullRequests": 0, "mergedPullRequests": 0, "commits": 0},
                )
            cal = data["contributionsCollection"]["contributionCalendar"]
            calendar = {
                "total": cal["totalContributions"],
                "days": [
                    {"date": d["date"], "count": d["contributionCount"]}
                    for week in cal["weeks"]
                    for d in week["contributionDays"]
                ],
            }
        except (urllib.error.HTTPError, RuntimeError, KeyError, TypeError) as err:
            print(f"  ! GraphQL indisponível: {err}", file=sys.stderr)

    hidden = {name.lower() for name in config.get("contributions", {}).get("hidden", [])}
    contributions = []
    for full_name, item in grouped.items():
        if full_name.lower() in hidden or full_name.split("/")[1].lower() in hidden:
            continue
        try:
            info = gh.get(f"/repos/{full_name}")
        except urllib.error.HTTPError:
            continue
        if info.get("private"):
            continue
        item.update(
            {
                "url": info["html_url"],
                "description": info.get("description") or "",
                "language": info.get("language") or "",
                "stars": info.get("stargazers_count", 0),
                "ownerAvatar": info["owner"]["avatar_url"],
                "topics": info.get("topics") or [],
            }
        )
        contributions.append(item)
    contributions.sort(key=contribution_score, reverse=True)
    contributions = contributions[: config.get("contributions", {}).get("max", 8)]
    for item in contributions:
        if not item["description"]:
            item["description"] = fetch_readme_summary(gh, item["fullName"])

    created = _parse_date(profile.get("created_at"))
    return {
        "generatedAt": now.isoformat(timespec="seconds"),
        "profile": {
            "login": profile["login"],
            "name": config.get("name") or profile.get("name") or profile["login"],
            "avatarUrl": profile["avatar_url"],
            "bio": profile.get("bio") or "",
            "location": profile.get("location") or "",
            "company": profile.get("company") or "",
            "blog": profile.get("blog") or "",
            "url": profile["html_url"],
            "followers": profile.get("followers", 0),
            "createdAt": profile.get("created_at"),
        },
        "stats": {
            "publicRepos": len(own),
            "stars": sum(r.get("stargazers_count", 0) for r in own),
            "forks": sum(r.get("forks_count", 0) for r in own),
            "contributedRepos": len(grouped),
            "mergedPullRequests": sum(i["mergedPullRequests"] for i in grouped.values()),
            "yearsOnGitHub": max(1, (now - created).days // 365) if created else None,
            "contributionsLastYear": calendar["total"] if calendar else None,
        },
        "languages": language_breakdown(totals),
        "projects": projects,
        "contributions": contributions,
        "calendar": calendar,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--sample", action="store_true", help="usa dados de exemplo, sem acessar a API")
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    args = parser.parse_args()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    if args.sample:
        shutil.copyfile(SAMPLE_PATH, args.output)
        print(f"✓ Dados de exemplo copiados para {args.output}")
        return 0

    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token:
        print("! GITHUB_TOKEN não definido: usando a API sem autenticação (limite de 60 req/h).")
    data = collect(GitHub(token), config)
    args.output.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        f"✓ {len(data['projects'])} projetos e {len(data['contributions'])} contribuições "
        f"gravados em {args.output}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
