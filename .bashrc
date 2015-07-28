#PATH=$PATH:/home/thomasduplessis/activator-1.2.12

PATH=$PATH:~/bin
export PATH

pathmunge () {
if ! echo $PATH | /bin/egrep -q "(^|:)$1($|:)" ; then
   if [ "$2" = "after" ] ; then
      PATH=$PATH:$1
   else
      PATH=$1:$PATH
   fi
fi
}
connectToThredge(){
    psql --host=thredge.c8jypjw1mid7.us-east-1.rds.amazonaws.com --port=5432 --username=thomasduplessis --password --dbname=Thredge 
}

connectToSparky(){
    telnet sparky.ic.sunysb.edu
}
