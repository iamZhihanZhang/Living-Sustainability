# Modifying the prompt

If you wish to modify the prompt as needed, go to `public/prompt/current_prompt.txt`, modify anything you need, push the changes to github, and run `fly deploy` to deploy the changes.

# Setting secret environment variable

```bash
fly secrets set SUPER_SECRET_KEY=password1234
```

# Required API Keys

Set the following with your own credentials:

OpenAI
```bash
fly secrets set OPENAI_API_KEY=your_openai_api_key
```

Climatiq
```bash
fly secrets set CLIMATIQ_API_KEY=your_climatiq_api_key
```

Google
```bash
fly secrets set GOOGLE_API_KEY=your_google_api_key
fly secrets set GOOGLE_CS_CX=your_google_cs_cx
```


# Visit the app

`fly apps open`

# Check app status

`fly status`

# Deploying the server

`fly deploy`

# Associate a Fly App with your Fly Postgres cluster app.

`fly postgres attach <postgres app name> --app <app name>`

# Accessing the postgres database (lca-database)

`flyctl postgres connect -a lca-database`

## Switch to a database (lca-phone-dn)

`\c lca_phone_db`

# Running python guideline

## Exit the current virtual environment:

`deactivate`

## Delete existing virtual environment:

`rm -rf /Users/pu098/Code/lca-server/venv`

## Create a New Virtual Environment Using Python 3.12:

`/usr/local/bin/python3.12 -m venv /Users/pu098/Code/lca-server/venv`

## Activate the New Virtual Environment:

`source /Users/pu098/Code/lca-server/venv/bin/activate`

## View installed dependencies in the virtual environment:

`pip list`

# All of the python dependencies needed for script.py:

`pip install requests beautifulsoup4 google langchain langchain-community "unstructured[all-docs]" unstructured`
