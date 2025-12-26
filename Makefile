all: format lint sort

format:
	@poetry run black .

lint:
	@poetry run flake8 -v .

sort:
	@poetry run isort .
