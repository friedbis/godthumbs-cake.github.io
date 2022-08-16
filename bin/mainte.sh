#!/bin/bash

BASEDIR=$(dirname $0)
TARGETDIR=$BASEDIR/../docs/_posts
FILENAME=1999-01-08-archive.md
FILESIZELIMIT=2 # file size until clean-up -> N[MB]

echo "checking directory[${TARGETDIR}/]..."
cat <(find $TARGETDIR/ -maxdepth 1 -size +${FILESIZELIMIT}M -type f -name ${FILENAME} -print) |while read i;
do
    echo "cleaning archive file..."
    mv $TARGETDIR/$FILENAME $TARGETDIR/$(date +%Y-%m-%d)-archive.md && echo "" >$TARGETDIR/$FILENAME
done
echo "OK"

