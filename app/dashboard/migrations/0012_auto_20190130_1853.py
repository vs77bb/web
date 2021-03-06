# Generated by Django 2.1.2 on 2019-01-30 18:53

from django.db import migrations, models
import economy.models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0011_auto_20190130_1852'),
    ]

    operations = [
        migrations.AddField(
            model_name='labsresearch',
            name='created_on',
            field=models.DateTimeField(db_index=True, default=economy.models.get_time),
        ),
        migrations.AddField(
            model_name='labsresearch',
            name='modified_on',
            field=models.DateTimeField(default=economy.models.get_time),
        ),
        migrations.AddField(
            model_name='toolvote',
            name='created_on',
            field=models.DateTimeField(db_index=True, default=economy.models.get_time),
        ),
        migrations.AddField(
            model_name='toolvote',
            name='modified_on',
            field=models.DateTimeField(default=economy.models.get_time),
        ),
    ]
