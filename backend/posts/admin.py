from django.contrib import admin
from django.contrib.auth.models import Group
from rest_framework.authtoken.models import TokenProxy

# Unregister unnecessary default and third-party models to keep the admin site clean
try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass

try:
    admin.site.unregister(TokenProxy)
except admin.sites.NotRegistered:
    pass
