# Generated by Django 3.1.7 on 2021-03-16 13:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ground_view', '0008_auto_20210316_2151'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reservationtarget',
            name='gno_csv',
            field=models.CharField(default='', max_length=40, verbose_name='号面CSV'),
        ),
    ]