#!/bin/bash

xmlgetnext () {
   local IFS='>'
   read -d '<' TAG VALUE
}

#countoffsetfile=/tmp/postcount.txt
#
#if [ ! -f $countoffsetfile ];
#then
#    echo 0 >$countoffsetfile
#fi

basedir=$(dirname $0)/..
rssurl=http://headline.5ch.net/bbynews/news.rss
templatefile=$(dirname $0)/post-template.txt
postdate=$(date +%Y-%m-%d)
#postcount=$(head -1 $countoffsetfile)
destdir=$(dirname $0)/../docs/_posts

echo -n 'getting page...'
echo 'parsing...'
curl -s $rssurl |nkf -w | while xmlgetnext;
do
  case $TAG in
    'item')
       title=''
       link=''
       pubDate=''
       description=''
       newpostfile=''
       newstitle=''
       ;;
    'title')
       title="$VALUE"
       ;;
    'link')
       link="$VALUE"
       ;;
    'pubDate')
       pubDate="$VALUE"
       ;;
    'description')
       description="$VALUE"
       ;;
    '/item')
       #postcount=$(expr $postcount + 1)
       echo "setting title"
       newstitle=$(echo -n "${title}" |sed -e 's/[【][^】]*[】]//g; s/\[[^]]*\]//g' 2>/dev/null)
       echo "${newstitle}"
       echo "setting postid"
       postid=$(echo -n "${title}" |md5sum |awk '{print $1;}')
       echo "setting post file"
       newpostfile=${destdir}/${postdate}-${postid}.md
       echo $newpostfile
       #echo "setting count file"
       #echo $postcount >$countoffsetfile
       echo "checking dupricated..."
       ret=$(ls -l $destdir |grep $postid >/dev/null 2>/dev/null && echo -n "OK" || echo -n "NG")
       if [ "x${ret}" == "xOK" ];
       then
           echo "found same post"
       else
           echo "copying file"
           cp $templatefile $newpostfile
           echo "setting header"
           sed -i -e "s/===title===/${newstitle:0:20}.../g;" $newpostfile
           sed -i -e "s/===subtitle===/${pubDate}/g;" $newpostfile 
           sed -i -e "s/===post-excerpt===//g" $newpostfile
           description=$(echo $description |sed -e 's/\(http[^$]*\.[jpg][pni][gf]\)/![](\1)/g')
           echo "setting body"
           cat<<EOF>>$newpostfile
[${newstitle}](${link})
posted on ${pubDate}

<!--more-->

${description}
EOF
       fi
       ;;
  esac
done

cd $basedir
git pull
git add *
git commit -m "newschecker updated"
git push -u origin main 
exit 0
