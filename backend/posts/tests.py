from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from .models import Post, Comment

class BlogAPITests(APITestCase):
    def setUp(self):
        # Create users
        self.user_a = User.objects.create_user(username='usera', password='password123', email='a@example.com')
        self.user_b = User.objects.create_user(username='userb', password='password123', email='b@example.com')
        
        # Create tokens
        self.token_a = Token.objects.create(user=self.user_a)
        self.token_b = Token.objects.create(user=self.user_b)
        
        # Create a post owned by user_a
        self.post = Post.objects.create(
            title="User A Post",
            content="This is the content of User A's post.",
            author=self.user_a
        )
        
        # Create a comment on post owned by user_b
        self.comment = Comment.objects.create(
            post=self.post,
            author=self.user_b,
            content="Great post!"
        )

    def test_public_can_list_posts(self):
        url = reverse('post-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_unauthenticated_cannot_create_post(self):
        url = reverse('post-list')
        data = {'title': 'New Post', 'content': 'Content here'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_create_post(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token_a.key)
        url = reverse('post-list')
        data = {'title': 'New Post', 'content': 'Content here'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 2)
        # Check auto slug generation
        self.assertEqual(response.data['slug'], 'new-post')

    def test_owner_can_update_post(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token_a.key)
        url = reverse('post-detail', kwargs={'pk': self.post.id})
        data = {'title': 'Updated Title', 'content': 'Updated content'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, 'Updated Title')

    def test_non_owner_cannot_update_post(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token_b.key)
        url = reverse('post-detail', kwargs={'pk': self.post.id})
        data = {'title': 'Updated Title', 'content': 'Updated content'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_delete_post(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token_a.key)
        url = reverse('post-detail', kwargs={'pk': self.post.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Post.objects.count(), 0)

    def test_non_owner_cannot_delete_post(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token_b.key)
        url = reverse('post-detail', kwargs={'pk': self.post.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_public_can_view_comments(self):
        url = reverse('post_comments', kwargs={'post_id': self.post.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_authenticated_can_add_comment(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token_a.key)
        url = reverse('post_comments', kwargs={'post_id': self.post.id})
        data = {'content': 'Another comment'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 2)

    def test_owner_can_update_comment(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token_b.key)
        url = reverse('comment_detail', kwargs={'pk': self.comment.id})
        data = {'content': 'Updated comment content'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.content, 'Updated comment content')

    def test_non_owner_cannot_update_comment(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token_a.key)
        url = reverse('comment_detail', kwargs={'pk': self.comment.id})
        data = {'content': 'Updated comment content'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_delete_comment(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token_b.key)
        url = reverse('comment_detail', kwargs={'pk': self.comment.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Comment.objects.count(), 0)

    def test_non_owner_cannot_delete_comment(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token_a.key)
        url = reverse('comment_detail', kwargs={'pk': self.comment.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_superuser_login_denied(self):
        superuser = User.objects.create_superuser(username='superadmin', password='password123', email='super@example.com')
        url = reverse('auth_login')
        data = {'username': 'superadmin', 'password': 'password123'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('error', response.data)

    def test_superuser_cannot_create_post(self):
        superuser = User.objects.create_superuser(username='superadmin2', password='password123', email='super2@example.com')
        superuser_token = Token.objects.create(user=superuser)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + superuser_token.key)
        url = reverse('post-list')
        data = {'title': 'Admin Post', 'content': 'Administrators should not write posts.'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('error', response.data)

