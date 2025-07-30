import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKV } from '@github/spark/hooks';
import { 
  Search,
  BookOpen,
  Video,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Rocket,
  Users,
  Zap
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  rating: number;
  lastUpdated: Date;
  estimatedReadTime: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  lastResponse?: Date;
}

export function ComprehensiveHelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
  const [supportTickets, setSupportTickets] = useKV('support-tickets', []);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'getting-started', name: 'Getting Started', icon: Rocket },
    { id: 'notes', name: 'Notes & Writing', icon: FileText },
    { id: 'ai-features', name: 'AI Features', icon: Zap },
    { id: 'collaboration', name: 'Collaboration', icon: Users },
    { id: 'billing', name: 'Billing & Plans', icon: HelpCircle },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: Lightbulb }
  ];

  const helpArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with Cortex: Your First 5 Minutes',
      content: 'Learn how to create your first note, set up your workspace, and start using AI features...',
      category: 'getting-started',
      tags: ['beginner', 'setup', 'tutorial'],
      views: 1250,
      rating: 4.8,
      lastUpdated: new Date('2024-01-15'),
      estimatedReadTime: 3
    },
    {
      id: '2',
      title: 'Mastering AI-Powered Note Organization',
      content: 'Discover how Cortex automatically categorizes and tags your notes using advanced AI...',
      category: 'ai-features',
      tags: ['ai', 'organization', 'automation'],
      views: 890,
      rating: 4.9,
      lastUpdated: new Date('2024-01-14'),
      estimatedReadTime: 5
    },
    {
      id: '3',
      title: 'Team Collaboration Best Practices',
      content: 'Learn how to effectively collaborate with your team using shared workspaces...',
      category: 'collaboration',
      tags: ['team', 'sharing', 'workflow'],
      views: 675,
      rating: 4.7,
      lastUpdated: new Date('2024-01-13'),
      estimatedReadTime: 7
    },
    {
      id: '4',
      title: 'Understanding Subscription Plans and Billing',
      content: 'Complete guide to Cortex pricing, billing cycles, and plan features...',
      category: 'billing',
      tags: ['pricing', 'subscription', 'billing'],
      views: 445,
      rating: 4.6,
      lastUpdated: new Date('2024-01-12'),
      estimatedReadTime: 4
    }
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I export my notes?',
      answer: 'You can export your notes in multiple formats (PDF, Markdown, DOCX) from the note menu or in bulk from the dashboard.',
      category: 'notes',
      helpful: 45,
      notHelpful: 3
    },
    {
      id: '2',
      question: 'Can I use Cortex offline?',
      answer: 'Yes! Cortex works offline and automatically syncs your changes when you\'re back online.',
      category: 'getting-started',
      helpful: 78,
      notHelpful: 5
    },
    {
      id: '3',
      question: 'How accurate is the AI summarization?',
      answer: 'Our AI achieves 95%+ accuracy for most content types and continuously improves based on user feedback.',
      category: 'ai-features',
      helpful: 92,
      notHelpful: 8
    },
    {
      id: '4',
      question: 'What happens if I downgrade my plan?',
      answer: 'Your data remains safe. Some advanced features may become unavailable, but all your content is preserved.',
      category: 'billing',
      helpful: 34,
      notHelpful: 2
    }
  ];

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedCategory]);

  const handleSearch = () => {
    let results = helpArticles;

    if (selectedCategory !== 'all') {
      results = results.filter(article => article.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      results = results.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setSearchResults(results);
  };

  const handleFeedback = async (articleId: string, helpful: boolean) => {
    setFeedbackSubmitted(prev => ({ ...prev, [articleId]: true }));
    
    toast.success(
      helpful ? 'Thanks for your feedback!' : 'Thanks! We\'ll improve this article.',
      {
        description: helpful 
          ? 'Glad we could help!' 
          : 'Your feedback helps us make our documentation better.'
      }
    );

    // In production, send feedback to analytics
    console.log('Feedback submitted:', { articleId, helpful });
  };

  const createSupportTicket = async (ticketData: any) => {
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      subject: ticketData.subject,
      status: 'open',
      priority: ticketData.priority || 'medium',
      createdAt: new Date()
    };

    await setSupportTickets((prev: SupportTicket[]) => [...prev, newTicket]);
    
    toast.success('Support ticket created!', {
      description: `Ticket #${newTicket.id} has been submitted. We'll respond within 24 hours.`
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold">Help Center</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find answers, tutorials, and get support for everything Cortex
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help articles, tutorials, and FAQs..."
            className="pl-12 h-14 text-lg"
          />
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {['Getting Started', 'AI Features', 'Keyboard Shortcuts', 'Billing Help'].map((link) => (
            <Badge
              key={link}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setSearchQuery(link.toLowerCase())}
            >
              {link}
            </Badge>
          ))}
        </div>
      </motion.div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles">Help Articles</TabsTrigger>
          <TabsTrigger value="tutorials">Video Tutorials</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="support">Contact Support</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {searchResults.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="glass-card h-full hover:glass-elevated transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {categories.find(c => c.id === article.category)?.name}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground">{article.rating}</span>
                        </div>
                      </div>
                      
                      <CardTitle className="text-lg leading-tight">
                        {article.title}
                      </CardTitle>
                      
                      <CardDescription className="line-clamp-2">
                        {article.content}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.estimatedReadTime} min read
                        </div>
                        <span>{article.views} views</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          Read Article
                          <ChevronRight className="w-3 h-3" />
                        </Button>

                        {!feedbackSubmitted[article.id] ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(article.id, true)}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(article.id, false)}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="text-xs">Thanks!</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {searchResults.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse our categories
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Getting Started with Cortex', duration: '5:30', views: '2.1K' },
              { title: 'AI-Powered Note Taking', duration: '8:45', views: '1.8K' },
              { title: 'Team Collaboration Features', duration: '12:20', views: '1.3K' },
              { title: 'Advanced Search Techniques', duration: '6:15', views: '890' }
            ].map((tutorial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass-card hover:glass-elevated transition-all cursor-pointer">
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-r from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                      <Video className="w-12 h-12 text-primary" />
                    </div>
                    <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                      {tutorial.duration}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{tutorial.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{tutorial.views} views</span>
                      <Button variant="ghost" size="sm">
                        Watch Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground mb-4">{faq.answer}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Was this helpful?</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {faq.helpful}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8">
                            <ThumbsDown className="w-3 h-3 mr-1" />
                            {faq.notHelpful}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Live Chat */}
            <Card className="glass-card hover:glass-elevated transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                <p className="text-muted-foreground mb-4">
                  Get instant help from our support team
                </p>
                <Badge variant="outline" className="mb-4">
                  Average response: 2 min
                </Badge>
                <Button className="w-full">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            {/* Email Support */}
            <Card className="glass-card hover:glass-elevated transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Mail className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                <p className="text-muted-foreground mb-4">
                  Send us a detailed message about your issue
                </p>
                <Badge variant="outline" className="mb-4">
                  Response within 24h
                </Badge>
                <Button variant="outline" className="w-full">
                  Send Email
                </Button>
              </CardContent>
            </Card>

            {/* Phone Support */}
            <Card className="glass-card hover:glass-elevated transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Phone className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
                <p className="text-muted-foreground mb-4">
                  Talk directly with our technical experts
                </p>
                <Badge variant="outline" className="mb-4">
                  Enterprise plans only
                </Badge>
                <Button variant="outline" className="w-full">
                  Schedule Call
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Support Tickets */}
          {supportTickets.length > 0 && (
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Your Support Tickets</CardTitle>
                <CardDescription>
                  Track the status of your support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supportTickets.slice(0, 3).map((ticket: SupportTicket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {ticket.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={ticket.status === 'resolved' ? 'default' : 'secondary'}
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}