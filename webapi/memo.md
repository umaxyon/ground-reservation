■modelからマイグレートファイル作成
```shell
python manage.py makemigrations ground_view
```


■マイグレートファイルのSQL確認
```shell
python manage.py sqlmigrate ground_view 0001
```


■マイグレートファイルの適用
```shell
python manage.py migrate ground_view
```