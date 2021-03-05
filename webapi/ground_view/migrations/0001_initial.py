# Generated by Django 3.1.7 on 2021-03-05 06:02

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GroundInfo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ym', models.IntegerField(max_length=6, verbose_name='年月')),
                ('dt', models.IntegerField(max_length=2, verbose_name='日')),
                ('week_day', models.CharField(max_length=1, verbose_name='曜日')),
                ('area', models.CharField(max_length=10, verbose_name='地域')),
                ('gname', models.CharField(max_length=15, verbose_name='グラウンド名')),
                ('timebox', models.IntegerField(max_length=2, verbose_name='時間帯')),
            ],
        ),
    ]