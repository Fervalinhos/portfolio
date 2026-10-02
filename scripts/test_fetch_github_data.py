"""Testes das regras de seleção do script de dados (python -m unittest)."""

import unittest
from collections import Counter
from datetime import datetime, timezone

from fetch_github_data import (
    contribution_score,
    group_contributions,
    language_breakdown,
    readme_summary,
    score_repo,
    select_projects,
)

NOW = datetime(2026, 10, 1, tzinfo=timezone.utc)


def repo(name, **extra):
    base = {
        "name": name,
        "full_name": f"dev/{name}",
        "stargazers_count": 0,
        "forks_count": 0,
        "size": 100,
        "language": "Python",
        "pushed_at": "2026-09-01T00:00:00Z",
    }
    return {**base, **extra}


class ScoreRepoTest(unittest.TestCase):
    def test_stars_description_and_recency_raise_score(self):
        plain = score_repo(repo("a", pushed_at="2023-01-01T00:00:00Z"), NOW)
        rich = score_repo(repo("b", stargazers_count=5, description="x", homepage="https://x"), NOW)
        self.assertGreater(rich, plain)

    def test_archived_is_penalised(self):
        self.assertLess(score_repo(repo("a", archived=True), NOW), score_repo(repo("a"), NOW))


class SelectProjectsTest(unittest.TestCase):
    def test_filters_hidden_forks_and_profile_readme(self):
        repos = [repo("dev"), repo("portfolio"), repo("forked", fork=True), repo("app")]
        config = {"projects": {"hidden": ["portfolio"], "max": 10}}
        names = [r["name"] for r in select_projects(repos, config, "dev", NOW)]
        self.assertEqual(names, ["app"])

    def test_featured_come_first_in_given_order(self):
        repos = [repo("popular", stargazers_count=100), repo("second"), repo("first")]
        config = {"projects": {"featured": ["first", "second"], "max": 10}}
        names = [r["name"] for r in select_projects(repos, config, "dev", NOW)]
        self.assertEqual(names, ["first", "second", "popular"])

    def test_skips_repos_without_code_unless_featured(self):
        repos = [repo("empty", language=None), repo("kept-empty", language=None), repo("app")]
        config = {"projects": {"featured": ["kept-empty"], "max": 10}}
        names = [r["name"] for r in select_projects(repos, config, "dev", NOW)]
        self.assertEqual(names, ["kept-empty", "app"])

    def test_respects_max(self):
        repos = [repo(f"r{i}") for i in range(5)]
        self.assertEqual(len(select_projects(repos, {"projects": {"max": 2}}, "dev", NOW)), 2)


class GroupContributionsTest(unittest.TestCase):
    def test_groups_prs_and_commits_and_skips_own_repos(self):
        prs = [
            {"repository_url": "https://api.github.com/repos/org/lib", "pull_request": {"merged_at": "2026-01-01"}},
            {"repository_url": "https://api.github.com/repos/org/lib", "pull_request": {"merged_at": None}},
            {"repository_url": "https://api.github.com/repos/dev/mine", "pull_request": {}},
        ]
        commits = [{"repository": {"full_name": "friend/school"}}, {"repository": {"full_name": "Dev/own"}}]
        grouped = group_contributions(prs, commits, "dev")
        self.assertEqual(set(grouped), {"org/lib", "friend/school"})
        self.assertEqual(grouped["org/lib"]["pullRequests"], 2)
        self.assertEqual(grouped["org/lib"]["mergedPullRequests"], 1)
        self.assertEqual(grouped["friend/school"]["commits"], 1)

    def test_merged_prs_weigh_more_than_commits(self):
        merged = {"mergedPullRequests": 2, "pullRequests": 2, "commits": 0, "stars": 0}
        commits = {"mergedPullRequests": 0, "pullRequests": 0, "commits": 5, "stars": 0}
        self.assertGreater(contribution_score(merged), contribution_score(commits))


class ReadmeSummaryTest(unittest.TestCase):
    def test_takes_first_real_paragraph(self):
        md = (
            "# Projeto\n\n[![build](https://x/badge.svg)](https://x)\n\n"
            "- item de lista\n\n"
            "Aplicativo **feito em equipe** para [doações](https://x) ao Rio Grande do Sul.\n"
            "Segunda linha do parágrafo.\n\nOutro parágrafo."
        )
        self.assertEqual(
            readme_summary(md),
            "Aplicativo feito em equipe para doações ao Rio Grande do Sul. Segunda linha do parágrafo.",
        )

    def test_ignores_template_boilerplate(self):
        md = "# app\n\nThis project was bootstrapped with Create React App, a tool from Meta.\n"
        self.assertEqual(readme_summary(md), "")

    def test_ignores_next_js_template_instructions(self):
        md = (
            "This is a [Next.js](https://nextjs.org) project bootstrapped with `create-next-app`.\n\n"
            "## Getting Started\n\nFirst, run the development server:\n\n```bash\nnpm run dev\n```\n"
        )
        self.assertEqual(readme_summary(md), "")

    def test_truncates_long_text(self):
        summary = readme_summary("palavra " * 100, limit=50)
        self.assertTrue(summary.endswith("…"))
        self.assertLessEqual(len(summary), 51)


class LanguageBreakdownTest(unittest.TestCase):
    def test_percentages_and_other_bucket(self):
        totals = Counter({f"L{i}": 10 for i in range(10)})
        result = language_breakdown(totals)
        self.assertEqual(len(result), 9)
        self.assertEqual(result[-1], {"name": "Other", "percent": 20.0})

    def test_empty(self):
        self.assertEqual(language_breakdown(Counter()), [])


if __name__ == "__main__":
    unittest.main()
