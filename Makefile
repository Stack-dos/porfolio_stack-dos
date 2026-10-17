.PHONY: help install dev build preview check format format-check ci clean

help: ## Lista los objetivos
	@node -e "require('fs').readFileSync('Makefile','utf8').split('\n').filter(l=>/^[a-z-]+:.*## /.test(l)).forEach(l=>{const[t,d]=l.split(/:.*## /);console.log(t.padEnd(14)+d)})"

install: ## Instala dependencias
	npm install

dev: ## Servidor local en http://localhost:4321/porfolio_stack-dos/
	npm run dev

build: ## Genera el sitio en dist/
	npm run build

preview: ## Sirve dist/ (para probar el buscador)
	npm run preview

check: ## Chequeo de tipos (astro check)
	npx astro check

format: ## Formatea el código con Prettier
	npx prettier --write src astro.config.mjs

format-check: ## Verifica el formato sin modificar
	npx prettier --check src astro.config.mjs

ci: ## Lo mismo que corre el CI: instalación limpia, check y build
	npm ci
	npx astro check
	npm run build

clean: ## Borra dist/ y .astro/
	node -e "for (const d of ['dist','.astro']) require('fs').rmSync(d,{recursive:true,force:true})"
