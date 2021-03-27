# Generated by Django 3.1.7 on 2021-03-27 05:42

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ground_view', '0014_auto_20210325_0039'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservationweeklytarget',
            name='available',
            field=models.IntegerField(default=0, validators=[django.core.validators.RegexValidator(regex='[0-1]')], verbose_name='有効無効'),
        ),
    ]
