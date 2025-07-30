import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DocumentArrowDownIcon, 
  DocumentTextIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  CalendarDaysIcon,
  ClockIcon,
  EnvelopeIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { springPresets } from '@/hooks/use-motion';

interface ReportBuilderProps {
  data: any;
  timeRange: string;
}

interface ReportConfig {
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  format: 'pdf' | 'excel' | 'powerpoint' | 'json';
  sections: string[];
  recipients: string[];
  scheduleEnabled: boolean;
  customFilters: Record<string, any>;
}

const reportTemplates = [
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level productivity overview for leadership',
    sections: ['kpi-overview', 'goal-progress', 'key-insights', 'recommendations'],
    frequency: 'weekly',
    format: 'pdf'
  },
  {
    id: 'detailed',
    name: 'Detailed Analytics',
    description: 'Comprehensive analysis with all metrics',
    sections: ['kpi-overview', 'productivity-trends', 'time-distribution', 'goal-progress', 'burnout-analysis', 'insights', 'recommendations'],
    frequency: 'monthly',
    format: 'pdf'
  },
  {
    id: 'team',
    name: 'Team Performance',
    description: 'Collaboration and team productivity metrics',
    sections: ['team-overview', 'collaboration-metrics', 'project-progress', 'resource-allocation'],
    frequency: 'weekly',
    format: 'powerpoint'
  },
  {
    id: 'personal',
    name: 'Personal Dashboard',
    description: 'Individual productivity insights and goals',
    sections: ['personal-kpis', 'focus-analysis', 'goal-tracking', 'wellness-metrics'],
    frequency: 'daily',
    format: 'pdf'
  }
];

const availableSections = [
  { id: 'kpi-overview', name: 'KPI Overview', description: 'Key performance indicators and metrics' },
  { id: 'productivity-trends', name: 'Productivity Trends', description: 'Historical productivity analysis' },
  { id: 'time-distribution', name: 'Time Distribution', description: 'How time is allocated across activities' },
  { id: 'goal-progress', name: 'Goal Progress', description: 'Current status of goals and objectives' },
  { id: 'burnout-analysis', name: 'Burnout Analysis', description: 'Stress and wellbeing assessment' },
  { id: 'insights', name: 'AI Insights', description: 'Machine learning generated insights' },
  { id: 'recommendations', name: 'Recommendations', description: 'Actionable improvement suggestions' },
  { id: 'team-overview', name: 'Team Overview', description: 'Team performance summary' },
  { id: 'collaboration-metrics', name: 'Collaboration Metrics', description: 'Team interaction analysis' },
  { id: 'project-progress', name: 'Project Progress', description: 'Project milestone tracking' },
  { id: 'resource-allocation', name: 'Resource Allocation', description: 'Resource usage analysis' },
  { id: 'personal-kpis', name: 'Personal KPIs', description: 'Individual performance metrics' },
  { id: 'focus-analysis', name: 'Focus Analysis', description: 'Deep work and concentration patterns' },
  { id: 'wellness-metrics', name: 'Wellness Metrics', description: 'Work-life balance indicators' }
];

export function ReportBuilder({ data, timeRange }: ReportBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: '',
    description: '',
    frequency: 'weekly',
    format: 'pdf',
    sections: [],
    recipients: [],
    scheduleEnabled: false,
    customFilters: {}
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setReportConfig({
        title: template.name,
        description: template.description,
        frequency: template.frequency as any,
        format: template.format as any,
        sections: template.sections,
        recipients: [],
        scheduleEnabled: false,
        customFilters: {}
      });
    }
  };

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    setReportConfig(prev => ({
      ...prev,
      sections: checked 
        ? [...prev.sections, sectionId]
        : prev.sections.filter(s => s !== sectionId)
    }));
  };

  const handleGenerateReport = async () => {
    if (!reportConfig.title || reportConfig.sections.length === 0) {
      toast.error('Please provide a title and select at least one section');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success(`${reportConfig.format.toUpperCase()} report generated successfully!`);
      
      // In a real implementation, this would generate and download the actual report
      console.log('Generated report config:', reportConfig);
      
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScheduleReport = async () => {
    if (!reportConfig.scheduleEnabled) {
      toast.error('Please enable scheduling first');
      return;
    }

    toast.success(`Report scheduled for ${reportConfig.frequency} delivery`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10">
                <DocumentArrowDownIcon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">Report Builder</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create custom analytics reports with automated delivery
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCustomBuilder(!showCustomBuilder)}
              className="glass-card"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
              {showCustomBuilder ? 'Use Templates' : 'Custom Builder'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Templates / Custom Builder */}
        <div className="lg:col-span-2 space-y-6">
          {!showCustomBuilder ? (
            // Template Selection
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Start Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, ...springPresets.gentle }}
                  >
                    <Card 
                      className={cn(
                        "glass-card hover:glass-elevated transition-all duration-300 cursor-pointer",
                        selectedTemplate === template.id && "ring-2 ring-primary"
                      )}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{template.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {template.frequency}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {template.format.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {template.sections.length} sections included
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            // Custom Builder
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Custom Report Builder</h3>
              
              {/* Basic Configuration */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Basic Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Report Title</Label>
                      <Input
                        id="title"
                        value={reportConfig.title}
                        onChange={(e) => setReportConfig(prev => ({...prev, title: e.target.value}))}
                        placeholder="My Custom Report"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={reportConfig.frequency} onValueChange={(value: any) => 
                        setReportConfig(prev => ({...prev, frequency: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={reportConfig.description}
                      onChange={(e) => setReportConfig(prev => ({...prev, description: e.target.value}))}
                      placeholder="Brief description of the report purpose"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <div className="flex items-center gap-4">
                      {[
                        { value: 'pdf', icon: DocumentTextIcon, label: 'PDF' },
                        { value: 'excel', icon: TableCellsIcon, label: 'Excel' },
                        { value: 'powerpoint', icon: PresentationChartBarIcon, label: 'PowerPoint' }
                      ].map(format => (
                        <div key={format.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={format.value}
                            checked={reportConfig.format === format.value}
                            onCheckedChange={() => setReportConfig(prev => ({...prev, format: format.value as any}))}
                          />
                          <Label htmlFor={format.value} className="flex items-center gap-2 cursor-pointer">
                            <format.icon className="w-4 h-4" />
                            {format.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section Selection */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Report Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableSections.map(section => (
                      <div key={section.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
                        <Checkbox
                          id={section.id}
                          checked={reportConfig.sections.includes(section.id)}
                          onCheckedChange={(checked) => handleSectionToggle(section.id, checked as boolean)}
                        />
                        <div className="space-y-1">
                          <Label htmlFor={section.id} className="cursor-pointer font-medium">
                            {section.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Report Preview */}
          {(selectedTemplate || reportConfig.title) && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Report Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">{reportConfig.title}</h4>
                  {reportConfig.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {reportConfig.description}
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Format:</span>
                    <Badge variant="outline">{reportConfig.format.toUpperCase()}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Frequency:</span>
                    <Badge variant="secondary">{reportConfig.frequency}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sections:</span>
                    <span className="font-medium">{reportConfig.sections.length}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Included Sections:</h5>
                  <div className="space-y-1">
                    {reportConfig.sections.map(sectionId => {
                      const section = availableSections.find(s => s.id === sectionId);
                      return section ? (
                        <div key={sectionId} className="text-xs text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {section.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scheduling */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Automated Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedule"
                  checked={reportConfig.scheduleEnabled}
                  onCheckedChange={(checked) => setReportConfig(prev => ({...prev, scheduleEnabled: checked as boolean}))}
                />
                <Label htmlFor="schedule">Enable scheduled delivery</Label>
              </div>
              
              {reportConfig.scheduleEnabled && (
                <div className="space-y-3 mt-4 p-3 rounded-lg bg-muted/20">
                  <div className="space-y-2">
                    <Label>Recipients</Label>
                    <Input 
                      placeholder="email@example.com"
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Next delivery: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating || !reportConfig.title || reportConfig.sections.length === 0}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
            
            {reportConfig.scheduleEnabled && (
              <Button 
                variant="outline"
                onClick={handleScheduleReport}
                className="w-full"
              >
                <ClockIcon className="w-4 h-4 mr-2" />
                Schedule Delivery
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}