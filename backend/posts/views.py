from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, get_list_or_404
from django.db.models import Count

from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer, UserSerializer
from .permissions import IsOwnerOrReadOnly

# Authentication Views
class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = authenticate(request, username=username, password=password)
        if user is not None:
            if user.is_superuser or user.is_staff:
                return Response({'error': 'Administrators are restricted from accessing frontend portals. Use the Django admin site.'}, status=status.HTTP_403_FORBIDDEN)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid username or password.'}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            # Delete token
            request.user.auth_token.delete()
        except Exception:
            pass
        return Response({'success': 'Logged out successfully.'}, status=status.HTTP_200_OK)

class UserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


# Posts ViewSet
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def create(self, request, *args, **kwargs):
        if request.user.is_superuser or request.user.is_staff:
            return Response({'error': 'Administrators are not permitted to write articles.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


# Comments Views
class PostCommentsView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, post_id, *args, **kwargs):
        post = get_object_or_404(Post, pk=post_id)
        comments = post.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, post_id, *args, **kwargs):
        post = get_object_or_404(Post, pk=post_id)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_object(self, pk):
        obj = get_object_or_404(Comment, pk=pk)
        self.check_object_permissions(self.request, obj)
        return obj

    def put(self, request, pk, *args, **kwargs):
        comment = self.get_object(pk)
        serializer = CommentSerializer(comment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        comment = self.get_object(pk)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Analytics API for dashboard
class AnalyticsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        total_posts = Post.objects.count()
        total_comments = Comment.objects.count()
        
        # Word count calculation (approximate)
        posts = Post.objects.all()
        total_words = sum(len(p.content.split()) for p in posts)
        avg_word_count = round(total_words / total_posts) if total_posts > 0 else 0

        # Most active authors (aggregate count)
        active_authors = User.objects.annotate(
            posts_count=Count('posts')
        ).order_by('-posts_count')[:5]

        authors_data = [
            {'username': u.username, 'posts_count': u.posts_count}
            for u in active_authors if u.posts_count > 0
        ]

        # Activity by post (most commented)
        top_posts = Post.objects.annotate(
            comments_count=Count('comments')
        ).order_by('-comments_count')[:5]

        posts_data = [
            {'title': p.title, 'comments_count': p.comments_count}
            for p in top_posts if p.comments_count > 0
        ]

        return Response({
            'total_posts': total_posts,
            'total_comments': total_comments,
            'avg_word_count': avg_word_count,
            'active_authors': authors_data,
            'top_posts': posts_data
        }, status=status.HTTP_200_OK)
