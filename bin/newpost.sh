#!/bin/bash

basedir=/srv/github/godthumbs-cake/docs
postdir=$basedir/_posts

latestmdfile=$(ls -lrt $postdir |tail -1 |awk '{print $9;}')

newmdfile=$postdir/$(date +%Y-%m-%d)-newposts.md

echo "generating $newmdfile..."
echo "relating $latestmdfile..."
cp $postdir/$latestmdfile $newmdfile
echo "done"

exit 0
