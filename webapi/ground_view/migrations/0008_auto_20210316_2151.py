# Generated by Django 3.1.7 on 2021-03-16 12:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ground_view', '0007_auto_20210312_0259'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reservationtarget',
            name='gno_csv',
            field=models.CharField(default='', max_length=30, verbose_name='号面CSV'),
        ),
    ]