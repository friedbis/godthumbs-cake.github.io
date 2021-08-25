#!/bin/bash

BASEDIR=$(dirname $0)
if [ -f $BASEDIR/../.profile ];
then
    . $BASEDIR/../.profile
fi

SYSNAME=$(basename $0)
JSFILE=$BASEDIR/../movies.js
NODEBIN=$(which node)
OUTPUTFILE=$BASEDIR/../docs/movies.md

#
# functions
#
function _echo {
    args="$*"
    echo $args
    logger -t $SYSNAME $args
}

if [ "x${NODEBIN}" == "x" ];
then
    _echo "command was not found"
    exit 1
fi


if [ ! -f $JSFILE ];
then
    _echo "js file was not found"
    exit 1
fi

cd $BASEDIR
cd ..
_echo "lets get the movie moderation script started..."
$NODEBIN $JSFILE
if [ $? != 0 ];
then
    _echo "${JSFILE} was finished"
    exit 1
fi
_echo "done"
_echo "sync with git repository..."
git add $OUTPUTFILE && git commit -m 'movie updated' && git push -u origin main
_echo "done"


