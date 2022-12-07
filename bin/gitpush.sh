#!/bin/bash

BASEDIR=$(dirname $0)
QUEDIR=${BASEDIR}/../queue

ret=$(ls ${QUEDIR}/*.queue 2>/dev/null |wc -l)

if [ ${ret} -gt 0 ];
then
    echo "git push..."
    cd $BASEDIR/../
    git push -u origin main
    rm -f $QUEDIR/*.queue
    echo "done"
else
    echo "queue was not found"
fi

