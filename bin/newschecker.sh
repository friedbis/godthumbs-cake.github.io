#!/bin/bash

xmlgetnext () {
   local IFS='>'
   read -d '<' TAG VALUE
}

countoffsetfile=/tmp/postcount.txt

if [ ! -f $countoffsetfile ];
then
    echo 0 >$countoffsetfile
fi

rssurl=http://headline.5ch.net/bbynews/news.rss
templatefile=$(dirname $0)/post-template.txt
postdate=$(date +%Y-%m-%d)
postcount=$(head -1 $countoffsetfile)
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
       echo "setting post file"
       postcount=$(expr $postcount + 1)
       newpostfile=${destdir}/${postdate}-$(seq -f %04g ${postcount} |tail -1)-new-embarassing-world-stories.md
       echo $newpostfile
       echo "setting count file"
       echo $postcount >$countoffsetfile
       echo "setting title"
       newstitle=$(echo -n "${title}" |sed -e 's/[【][^】]*[】]//g; s/\[[^]]*\]//g' 2>/dev/null)
       echo "${newstitle}"
       echo "copying file"
       cp $templatefile $newpostfile
       echo "setting header"
       sed -i -e "s/===title===/${newstitle}/g;" $newpostfile
       sed -i -e "s/===subtitle===/${newstitle}/g;" $newpostfile 
       sed -i -e "s/===post-excerpt===/${newstitle:0:20}/g" $newpostfile
       description=$(echo $description |sed -e 's/\(http[^$]*\.[jpg][pni][gf]\)/![](\1)/g')
       echo "setting body"
       cat<<EOF>>$newpostfile
### [${newstitle}](${link})
#### posted on ${pubDate}

${newstitle}

<!--more-->

${description}
EOF
         ;;
      esac
done

