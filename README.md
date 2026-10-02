# Portfólio

Site de portfólio gerado automaticamente a partir do meu GitHub: projetos que criei, contribuições em repositórios de outras pessoas, tecnologias mais usadas e atividade do último ano.

**Site:** https://fervalinhos.github.io/portfolio/

## Stack

| Parte | Tecnologia |
| --- | --- |
| Dados | Python 3 (só biblioteca padrão) consultando a API REST e GraphQL do GitHub |
| Site | React 19 + TypeScript + Vite |
| Efeitos | [React Bits](https://reactbits.dev) (em `src/components/reactbits/`), com Motion e GSAP; cards no estilo dos menus de Persona 3 Reload (`src/components/P3Card.tsx`) |
| Hospedagem | GitHub Pages, publicado por GitHub Actions |

## Como funciona

1. `scripts/fetch_github_data.py` busca o perfil, os repositórios públicos e as contribuições (PRs e commits em repositórios de terceiros).
2. Cada repositório recebe uma pontuação de relevância (estrelas, forks, descrição, demo, tópicos, tamanho e atividade recente) e os melhores viram os projetos em destaque.
3. O resultado vai para `public/data/github.json`, que o site React lê.
4. O workflow `.github/workflows/deploy.yml` roda tudo isso a cada push na `main` e **todo dia**, então o portfólio se atualiza sozinho quando você cria um repositório novo.

## Personalizar

Edite `portfolio.config.json`:

| Campo | O que faz |
| --- | --- |
| `name` | Nome exibido (vazio = nome do perfil do GitHub) |
| `headline`, `about` | Título e texto "Sobre mim" em português e inglês |
| `links.linkedin` | URL do seu LinkedIn |
| `links.email`, `links.website`, `links.resume` | Contato, site e link para o currículo (PDF) |
| `projects.featured` | Nomes de repositórios que devem aparecer primeiro, na ordem dada |
| `projects.hidden` | Repositórios que não devem aparecer |
| `projects.includeForks` | Mostrar forks (padrão `false`) |
| `projects.max` | Quantidade máxima de projetos |
| `contributions.hidden` / `max` | Mesmo controle para as contribuições |

Dica: repositórios com **descrição**, **tópicos** e **link de demo** (campo "Website" do repositório) aparecem melhor e ganham mais pontos de relevância.

## Rodar localmente

Requer Node 20.19+ e Python 3.10+.

```bash
npm install
npm run data          # busca seus dados (use GITHUB_TOKEN=... para evitar limite de requisições)
# ou: npm run data:sample   para usar dados de exemplo sem internet
npm run dev
```

Outros comandos: `npm run build`, `npm run lint`, `npm run test:py`.

## Publicar no GitHub Pages

1. Em **Settings → Pages**, em "Build and deployment", escolha **Source: GitHub Actions**.
2. Faça merge na `main`. O workflow publica em `https://<usuario>.github.io/portfolio/`.
3. (Opcional) Para dados mais completos de contribuições, crie um token pessoal *fine-grained* só com acesso de leitura a repositórios públicos e salve como secret `PORTFOLIO_TOKEN` em **Settings → Secrets and variables → Actions**.

Se renomear o repositório para `<usuario>.github.io`, o site passa a ficar na raiz `https://<usuario>.github.io/` sem nenhuma outra mudança.

## Usar no LinkedIn e no GitHub

- **LinkedIn:** adicione o link do site em *Perfil → Adicionar seção → Destaques → Adicionar link* e também no campo *Site* das informações de contato. A prévia usa sua foto do GitHub.
- **GitHub:** coloque o link no campo *Website* do seu perfil e fixe (*Pin*) seus melhores repositórios. Um modelo de README de perfil está em [`docs/PROFILE_README.md`](docs/PROFILE_README.md).
