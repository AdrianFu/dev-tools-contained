set hour=%time:~0,2%
if "%hour:~0,1%" == " " set hour=0%hour:~1,1%
echo hour=%hour%
set min=%time:~3,2%
if "%min:~0,1%" == " " set min=0%min:~1,1%
echo min=%min%
set secs=%time:~6,2%
if "%secs:~0,1%" == " " set secs=0%secs:~1,1%
echo secs=%secs%


docker run -p 4200:4200 -p 3000:3000 --network dev-net --cap-add=NET_ADMIN --rm -it --hostname angularFat --name angular-sh-%hour%.%min%.%secs% -v %cd%:/home tianshufu/angular-fat bash --