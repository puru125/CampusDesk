
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Save, X, Eye, Pencil, RefreshCw } from "lucide-react";

// Mock data - In a real implementation, this would be stored in the database
const initialValidationRules = [
  { id: '1', name: 'Phone Number', pattern: '^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$', description: 'Standard phone number format', error_message: 'Please enter a valid phone number' },
  { id: '2', name: 'Email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', description: 'Standard email format', error_message: 'Please enter a valid email address' },
  { id: '3', name: 'Name', pattern: '^[a-zA-Z\\s\'-]{2,}$', description: 'Letters, spaces, hyphens and apostrophes only', error_message: 'Please enter a valid name' },
  { id: '4', name: 'Enrollment Number', pattern: '^[A-Za-z][0-9]{8,}$', description: 'Letter followed by at least 8 digits', error_message: 'Please enter a valid enrollment number' },
];

const ValidationRulesPage = () => {
  const { toast } = useToast();
  const [validationRules, setValidationRules] = useState(initialValidationRules);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [newRule, setNewRule] = useState({
    name: '',
    pattern: '',
    description: '',
    error_message: ''
  });
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
  };

  const handleUpdateRule = () => {
    if (!editingRule) return;
    
    setValidationRules(rules => rules.map(rule => 
      rule.id === editingRule.id ? editingRule : rule
    ));
    
    setEditingRule(null);
    
    toast({
      title: "Rule Updated",
      description: "Validation rule has been updated successfully.",
    });
  };

  const handleAddRule = () => {
    const id = (validationRules.length + 1).toString();
    setValidationRules([...validationRules, { id, ...newRule }]);
    setNewRule({
      name: '',
      pattern: '',
      description: '',
      error_message: ''
    });
    
    toast({
      title: "Rule Added",
      description: "New validation rule has been added successfully.",
    });
  };

  const handleTestValidations = () => {
    const results: Record<string, boolean> = {};
    
    validationRules.forEach(rule => {
      try {
        const regex = new RegExp(rule.pattern);
        results[rule.id] = regex.test(testInput);
      } catch (error) {
        results[rule.id] = false;
      }
    });
    
    setTestResults(results);
  };

  return (
    <>
      <PageHeader
        title="Validation Rules Configuration"
        description="Manage form validation rules for the entire system"
      >
        <Button variant="default">
          <Save className="mr-2 h-4 w-4" />
          Save All Changes
        </Button>
      </PageHeader>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Validation Rules</TabsTrigger>
          <TabsTrigger value="tester">Validation Tester</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Validation Rules</CardTitle>
              <CardDescription>
                These rules are applied across the system for form validations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Pattern</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="hidden md:table-cell">Error Message</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationRules.map((rule) => (
                    <TableRow key={rule.id}>
                      {editingRule && editingRule.id === rule.id ? (
                        <>
                          <TableCell>
                            <Input 
                              value={editingRule.name}
                              onChange={(e) => setEditingRule({...editingRule, name: e.target.value})}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={editingRule.pattern}
                              onChange={(e) => setEditingRule({...editingRule, pattern: e.target.value})}
                            />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Input 
                              value={editingRule.description}
                              onChange={(e) => setEditingRule({...editingRule, description: e.target.value})}
                            />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Input 
                              value={editingRule.error_message}
                              onChange={(e) => setEditingRule({...editingRule, error_message: e.target.value})}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={handleUpdateRule}>
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{rule.name}</TableCell>
                          <TableCell className="font-mono text-sm">{rule.pattern}</TableCell>
                          <TableCell className="hidden md:table-cell">{rule.description}</TableCell>
                          <TableCell className="hidden md:table-cell">{rule.error_message}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEditRule(rule)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Validation Rule</CardTitle>
              <CardDescription>
                Create a new validation pattern that can be used across the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule-name">Rule Name</Label>
                    <Input
                      id="rule-name"
                      placeholder="e.g., Phone Number"
                      value={newRule.name}
                      onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rule-pattern">RegEx Pattern</Label>
                    <Input
                      id="rule-pattern"
                      placeholder="e.g., ^[0-9]{10}$"
                      value={newRule.pattern}
                      onChange={(e) => setNewRule({...newRule, pattern: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-description">Description</Label>
                  <Input
                    id="rule-description"
                    placeholder="e.g., 10-digit phone number format"
                    value={newRule.description}
                    onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-error">Error Message</Label>
                  <Input
                    id="rule-error"
                    placeholder="e.g., Please enter a valid 10-digit phone number"
                    value={newRule.error_message}
                    onChange={(e) => setNewRule({...newRule, error_message: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddRule}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="tester" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Validation Rules</CardTitle>
              <CardDescription>
                Enter a value to test against all validation rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-input">Test Input</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="test-input"
                      placeholder="Enter value to test"
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleTestValidations}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Test
                    </Button>
                  </div>
                </div>
                
                {Object.keys(testResults).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Results</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rule</TableHead>
                          <TableHead>Pattern</TableHead>
                          <TableHead>Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationRules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell>{rule.name}</TableCell>
                            <TableCell className="font-mono text-sm">{rule.pattern}</TableCell>
                            <TableCell>
                              {testResults[rule.id] !== undefined && (
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  testResults[rule.id] 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {testResults[rule.id] ? 'Valid' : 'Invalid'}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ValidationRulesPage;
