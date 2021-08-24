#!/bin/bash

BASEDIR=$(dirname $0)
JSFILE=$BASEDIR/../movies.js
NODEBIN=$(which node)
OUTPUTFILE=$BASEDIR/../docs/movies.md

if [ "x${NODEBIN}" == "x" ];
then
    echo "command was not found"
    exit 1
fi


if [ ! -f $JSFILE ];
then
    echo "js file was not found"
    exit 1
fi

cd $BASEDIR
cd ..
$NODEBIN $JSFILE && git add $OUTPUTFILE && git commit -m 'movie updated' && git push -u origin main


