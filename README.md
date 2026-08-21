# Foli Next

Job search workspace built with Next.js, Supabase, and DaisyUI.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [pnpm](https://pnpm.io/installation) 10 or later

### Install dependencies

```bash
pnpm install
```

### Environment variables

Create a `.env.local` file in the project root (copy from `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
OPENAI_API_KEY=sk-your_openai_api_key
```

`OPENAI_API_KEY` is server-only. Do not prefix it with `NEXT_PUBLIC_` or it will be exposed to the browser.

### Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other commands

```bash
# Production build
pnpm build

# Run production build locally
pnpm start

# Lint
pnpm lint
```



## TODO
- could there be a general notes or to do section on a dashboard or as a side panel by default on the jobs screen? would be helpful to keep track of little things or maybe tips collected.
