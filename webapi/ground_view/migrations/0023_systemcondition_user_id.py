# Generated by Django 3.1.7 on 2021-03-31 07:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ground_view', '0022_reservationtarget_user_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='systemcondition',
            name='user_id',
            field=models.CharField(default='', max_length=2, verbose_name='ユーザーID'),
        ),
    ]
