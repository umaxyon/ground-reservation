#!/bin/bash

cd "$(dirname "$0")" || exit 1
source venv/bin/activate

# ユーザーとパスを含めてpushしないこと!
export DB_HOST=localhost
export DB_PORT=
export DB_USER=
export DB_PASS=

python scraping/scheduler.py
