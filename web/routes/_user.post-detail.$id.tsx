import { useParams } from "react-router";
import { useFindOne, useFindMany, useAction, useSession } from "@gadgetinc/react";
import { api } from "../api";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AutoForm, AutoInput, AutoSubmit, AutoHiddenInput } from "../components/auto";

export default function PostDetail() {
  const { id } = useParams();

  // Fetch post details
  const [{ data: post, error: postError, fetching: fetchingPost }, refreshPost] = useFindOne(api.post, id!, {
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      foodAllergens: true,
      goBadDate: true,
      location: true,
      images: true,
      status: true,
      user: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
  });

  // Get current user session
  const session = useSession(api);

  const currentUserId = session?.user?.id;
  const postOwnerId = post?.user?.id;

  // Fetch messages between current user and post owner
  const [{ data: messages, error: messagesError, fetching: fetchingMessages }, refreshMessages] = useFindMany(api.message, {
    filter: {
      OR: [
        // Messages where current user is the sender and post owner is the recipient
        {
          AND: [
            { senderId: { equals: currentUserId } },
            { recipientId: { equals: postOwnerId } },
            { postId: { equals: id } },
          ],
        },
        // Messages where current user is the recipient and post owner is the sender
        {
          AND: [
            { senderId: { equals: postOwnerId } },
            { recipientId: { equals: currentUserId } },
            { postId: { equals: id } },
          ],
        },
      ],
    },
    sort: { createdAt: "Ascending" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      senderId: true,
      read: true,
      status: true,
    },
  });




  // Mark messages as read when viewed
  useEffect(() => {
    if (messages && currentUserId) {
      const unreadMessages = messages.filter(msg =>
        msg.senderId !== currentUserId && !msg.read);

      // Update unread messages to read (this would be ideal but is currently skipped as update permissions aren't set)
      // This would require setting up proper permissions for the message.update action
    }
  }, [messages, currentUserId]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  // Loading states
  if (fetchingPost && !post) {
    return (
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error states
  if (postError) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Post</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error loading this post. Please try again later.</p>
            <p className="text-sm text-gray-500">{postError.toString()}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Post Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The post you are looking for does not exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Post Details - Left Column */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{post.title}</CardTitle>
            <Badge variant={post.category === "leftovers" ? "secondary" : "default"}>
              {post.category === "leftovers" ? "Leftovers" : "Perishables"}
            </Badge>
          </div>
          <CardDescription>Posted by {post.user?.firstName} {post.user?.lastName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-lg">{post.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {post.location && (
              <div>
                <h3 className="font-medium text-sm text-gray-500">Location</h3>
                <p>{post.location}</p>
              </div>
            )}

            {post.goBadDate && (
              <div>
                <h3 className="font-medium text-sm text-gray-500">Goes Bad On</h3>
                <p>{formatDate(post.goBadDate)}</p>
              </div>
            )}
          </div>

          {post.foodAllergens && (
            <div>
              <h3 className="font-medium text-sm text-gray-500">Allergen Information</h3>
              <p>{post.foodAllergens}</p>
            </div>
          )}
          
          {(() => {
            // Helper function to normalize image data
            const getImageArray = () => {
              try {
                if (!post.images) return null;
        
                // If images is a string (JSON), try to parse it
                if (typeof post.images === 'string') {
                  try {
                    const parsed = JSON.parse(post.images);
                    return Array.isArray(parsed) ? parsed : [parsed];
                  } catch {
                    // If parsing fails, treat it as a single image URL
                    return [post.images];
                  }
                }
        
                // If images is already an array, use it directly
                if (Array.isArray(post.images)) {
                  return post.images.length > 0 ? post.images : null;
                }
        
                // If images is an object but not an array (like a single image object)
                if (typeof post.images === 'object') {
                  return [post.images];
                }
        
                return null;
              } catch (error) {
                console.error("Error processing images:", error);
                return null;
              }
            };
    
            const imageArray = getImageArray();
    
            if (!imageArray) {
              return (
                <div className="mt-4">
                  <h3 className="font-medium text-sm text-gray-500 mb-2">Images</h3>
                  <div className="p-4 bg-gray-100 rounded-md text-center text-gray-500">
                    No images available
                  </div>
                </div>
              );
            }
    
            return (
              <div className="mt-4">
                <h3 className="font-medium text-sm text-gray-500 mb-2">Images</h3>
                <div className="grid grid-cols-2 gap-2">
                  {imageArray.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                      {(() => {
                        try {
                          // Handle different image formats
                          const imgSrc = typeof image === 'string' 
                            ? image 
                            : image.url || image.src || image.source || null;
                  
                          if (!imgSrc) {
                            return <div className="flex items-center justify-center w-full h-full text-gray-500">Invalid image</div>;
                          }
                  
                          return (
                            <img 
                              src={imgSrc} 
                              alt={`Food image ${index + 1}`}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%236b7280'%3EImage Error%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          );
                        } catch (error) {
                          return <div className="flex items-center justify-center w-full h-full text-gray-500">Error</div>;
                        }
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Chat Interface - Right Column */}
      <Card>
        <CardHeader>
          <CardTitle>Message {post.user?.firstName || "Owner"}</CardTitle>
          <CardDescription>Chat about this food item</CardDescription>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {fetchingMessages && !messages ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-10 w-1/2 ml-auto" />
                <Skeleton className="h-10 w-2/3" />
              </div>
            ) : messagesError ? (
              <div className="p-3 bg-red-50 text-red-500 rounded-md">
                Error loading messages. Please refresh.
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-lg p-3 max-w-[80%] break-words ${message.senderId === currentUserId
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                        }`}
                    >
                      {message.content}
                      <div className={`text-xs mt-1 ${message.senderId === currentUserId ? 'text-green-100' : 'text-gray-500'
                        }`}>
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10">
                No messages yet. Start the conversation!
              </div>
            )}
          </ScrollArea>
        </CardContent>
      <CardFooter>
        <AutoForm action={api.message.create}
          defaultValues={{
            sender: '2',
            recipient: '13',
            postId: id,
          }}>
          <AutoInput field="content" label="message" />
          <AutoSubmit >
            Send Message
          </AutoSubmit>
        </AutoForm>
      </CardFooter>
      </Card>
    </div>
  );
}
