@ECHO OFF
git pull
git add .
git commit -m %1
git push