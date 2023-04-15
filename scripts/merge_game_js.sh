#! /bin/bash

path=/home/lty/diploma_project/game/static/js/
js_path_dist=${path}dist/
js_path_src=${path}src/

find $js_path_src -type f -name '*.js' | sort | xargs cat | terser -c -m > ${js_path_dist}game.js

echo yes | python3 manage.py collectstatic
