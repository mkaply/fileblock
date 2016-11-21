SHORTNAME=fileblock
rm  *.xpi
rm -rf $SHORTNAME
mkdir $SHORTNAME
cd $SHORTNAME
rsync -r --exclude=.svn --exclude-from=../excludefile.txt ../* .
VERSION=`grep "em:version" install.rdf | sed -e 's/[ \t]*em:version=//;s/"//g'`
TOOLBAR=$SHORTNAME-$VERSION
zip -r -D ../$TOOLBAR.xpi *
cd ..
rm -rf $SHORTNAME
