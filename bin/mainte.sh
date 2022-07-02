#!/bin/bash

BASEDIR=$(dirname $0)
TARGETDIR=$BASEDIR/../docs/_posts

echo "checking directory[${TARGETDIR}/]..."
find $TARGETDIR/ -maxdepth 1 -size +5M -type f -print 

