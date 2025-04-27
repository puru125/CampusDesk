
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ExamQuestionProps {
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
  selectedAnswer?: string;
  marks: number;
}

const ExamQuestion = ({ 
  question, 
  options, 
  onAnswer, 
  selectedAnswer,
  marks 
}: ExamQuestionProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <p className="text-lg font-medium">{question}</p>
            <span className="text-sm text-muted-foreground">
              {marks} {marks === 1 ? 'mark' : 'marks'}
            </span>
          </div>
          
          <RadioGroup
            onValueChange={onAnswer}
            value={selectedAnswer}
            className="space-y-2"
          >
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamQuestion;
