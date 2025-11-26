# AI Lesson System - Implementation Plan
*Updated based on working prototype demo*

## Overview
An AI-driven learning system that guides students through any memorization-focused topic using a **dynamic whiteboard interface**. The AI maintains a hidden knowledge graph (concepts → relationships → context) while progressively teaching, testing recall, and building mastery through erasure-based spaced repetition.

**Subjects:** History, Psychology, Environmental Science (APES), Biology, Government, Economics - any topic requiring deep reading comprehension and memorization.

**AI Provider:** DeepSeek (https://platform.deepseek.com)

## 🎯 Core Concept
The AI secretly builds a knowledge graph (concepts → relationships → context) but only reveals it piece by piece through:
- **Progressive disclosure** (one concept at a time)
- **Active prediction** (guess connections/outcomes)
- **Erasure-based recall** (rebuild what was taught)
- **Mastery tracking** (per-concept scores)

Works for chronological topics (History) AND non-chronological topics (Psych theories, biological systems, environmental cycles).

---

## 📊 Data Structures

### 1. Knowledge Node
```typescript
interface KnowledgeNode {
  id: string;
  type: 'concept' | 'event' | 'theory' | 'process' | 'definition';
  title: string;            // "Classical Conditioning" or "Boston Massacre"
  
  // Generated content (lazy-loaded on demand)
  summary?: string;         // 2-3 sentence explanation
  generatedAt?: Date;
  
  // Relationships (adapt to subject)
  relatedTo?: string[];     // IDs of connected nodes
  prerequisites?: string[]; // Concepts needed to understand this
  leads_to?: string[];      // What this enables/causes
  
  // Subject-specific metadata
  metadata: {
    // History: year, location, key figures
    // Psych: researcher, experiment, year
    // APES: location, ecosystem type, impact
    [key: string]: any;
  };
  
  vocabulary: Array<{
    term: string;
    definition: string;
  }>;
  
  thinkingQuestion?: string; // Reflection prompt after teaching
  
  // Mastery tracking
  masteryScore: number;     // 0-1
  recallAttempts: number;
  lastReviewed: Date;
}
```

### 2. Lesson State
```typescript
interface LessonState {
  id: string;
  userId: string;
  conversationId: string;
  subject: string;          // "History", "Psychology", "APES", etc.
  topic: string;
  
  // Knowledge Graph
  knowledgeGraph: KnowledgeNode[];
  currentNodeIndex: number;
  graphStructure: 'linear' | 'hierarchical' | 'networked';
  
  // Session state
  phase: 'teaching' | 'discussion' | 'recall' | 'quiz' | 'review' | 'complete';
  subPhase?: 'content' | 'question'; // Teaching sub-phases
  
  // Whiteboard camera state
  cameraMode: 'default' | 'context-back' | 'context-forward' | 'overview';
  isLocked: boolean; // Lock drag/zoom during specific phases
  
  // Recall state
  recallType?: 'partial' | 'full';
  erasedNodeId?: string;
  contextMessage?: string;
  
  // Progress
  nodesCompleted: number;
  overallMastery: number;
  sessionStarted: Date;
  lastActivity: Date;
}
```

### 3. Demo State (for prototype)
```typescript
interface DemoState {
  phase: "teaching" | "prediction" | "recall" | "quiz";
  subPhase?: "content" | "question";
  recallType?: "partial" | "full";
  erasedNodeId?: string;
  simulatedInput?: string;
  feedback?: "correct" | "incorrect" | null;
  quizQuestion?: string;
  contextMessage?: string;
  cameraMode?: "default" | "context-back" | "context-forward" | "overview";
  aiResponse?: string;
}
```

---

## 🎨 UI/UX Architecture (Based on Demo)

### Whiteboard Canvas Component
- **Infinite canvas** with pan/zoom support (using Framer Motion)
- **Camera lock system**: Auto-lock during recall/quiz, free during teaching
- **Node positioning**: Horizontal linear layout with dashed arrow connections
- **Grid background**: Subtle dot pattern for depth

### Visual Design Elements
1. **Node Cards** (500-800px width)
   - Year badge (top-left, blue pill)
   - Title (5xl, chalk font, bold)
   - Summary text (3xl, chalk font, animated reveal)
   - Vocabulary highlights (yellow marker-style background)
   - Vocabulary definitions (yellow-bordered boxes)

2. **Teaching Phase UI**
   - **Content Sub-Phase**: "Do you understand?" with green checkmark + Continue button
   - **Question Sub-Phase**: White speech bubble with thinking question + blue message icon

3. **Recall Modes**
   - **Partial Recall**: Erased vocabulary words appear as dashed underlines, student types above
   - **Full Recall**: Entire node replaced with blue dashed border box, large text input, context question at top

4. **Camera Behavior**
   - **context-back**: Zoom out to show current + previous node (0.75x scale)
   - **context-forward**: Zoom out to show current + next node (0.75x scale)
   - **overview**: Zoom out for quiz (0.6x scale, centered)

5. **Quiz Overlay**
   - Full-screen modal with backdrop blur
   - Multiple choice buttons
   - Progress indicator (Question X of Y)

6. **AI Feedback**
   - Written directly on whiteboard below node
   - Typewriter animation effect
   - Large chalk-style font (3xl)

7. **Chat Interface**
   - Fixed bottom, rounded pill shape
   - Blue brain icon
   - "Ask a question about this topic..." placeholder

---

## 🔄 The Lesson Flow (Updated from Demo)

### Phase 1: Setup / Structure Generation
**Trigger:** User clicks "Start Learning" on a lesson

**Process:**
1. AI generates **structure only** (no detailed content yet):
   ```
   Subject: [History | Psychology | APES | etc.]
   Topic: "American Revolution" | "Classical Conditioning" | "Carbon Cycle"
   
   Generate a learning structure outline:
   - Node titles only
   - Relationships between nodes
   - Vocabulary list (5-40 terms)
   - Subject-specific metadata
   
   DO NOT generate summaries yet - just structure.
   ```

2. Backend saves skeleton to `LessonState`
3. Pre-fetch first node content (Phase 1.5)

**Cost Savings:** ~70% reduction in initial API call

---

### Phase 1.5: Just-In-Time Content Generation
**Strategy:** Generate node content one ahead of current position

**When entering teaching mode for node N:**
- If `nodes[N].summary == null`: Generate it now (blocking, ~2-3s wait)
- Simultaneously pre-fetch `nodes[N+1].summary` in background

**Content Generation Prompt:**
```
Subject: [History/Psych/APES]
Node: { title: "Boston Massacre", metadata: { year: 1770 } }
Context: [Previous node summary if exists]
Vocabulary: ["occupation", "taxation"]

Generate teaching content:
- 2-3 sentences explaining the concept/event
- Highlight key vocabulary terms in context
- End with a thought-provoking question

Keep it concise and chalk-like (conversational tone).
```

**User Experience:**
- First node: ~2-3 second wait (acceptable)
- Subsequent nodes: Instant (pre-fetched)

---

### Phase 2: Teaching Phase
**UI State:** `phase = 'teaching'`, `cameraMode = 'default'`

**Flow:**
1. **Content Sub-Phase** (`subPhase = 'content'`)
   - Camera centers on current node
   - Title fades in
   - Summary animates with typewriter effect (3 chars every 20ms)
   - Vocabulary words get yellow highlight animation
   - Vocabulary definitions appear below (2s delay)
   - After 3s: "Do you understand?" + Continue button appears

2. **Question Sub-Phase** (`subPhase = 'question'`)
   - Thinking question appears in speech bubble
   - Student can:
     - Reflect silently and continue
     - Ask clarifying questions via chat (→ Phase 3)
     - Continue to next node

**Subject-Specific Examples:**

#### History Node
```
┌────────────────────────────────────┐
│  📅 1770                           │
│  The Boston Massacre               │
│                                    │
│  British soldiers fired into a     │
│  crowd of colonists, killing 5.    │
│  Tensions over taxation and        │
│  occupation had been rising...     │
│                                    │
│  📚 occupation                     │
│      British military presence in  │
│      the colonies                  │
│                                    │
│  💬 The colonists were furious     │
│      about being taxed without     │
│      representation. How might     │
│      they have responded?          │
└────────────────────────────────────┘
```

####Psychology Node
```
┌────────────────────────────────────┐
│  Classical Conditioning (Pavlov)   │
│                                    │
│  Dogs naturally salivate when      │
│  they see food (unconditioned).    │
│  Pavlov rang a bell before         │
│  feeding them repeatedly...        │
│                                    │
│  📚 UCS, UCR, CS, CR               │
│                                    │
│  💬 After many pairings, what do   │
│      you think happened when the   │
│      dogs just heard the bell?    │
└────────────────────────────────────┘
```

---

### Phase 3: Discussion Mode
**Trigger:** Student types question in chat

**Process:**
1. AI responds based on scoped context (previous 2 nodes + current node)
2. Response appears as handwritten text on whiteboard
3. Student can ask follow-ups or continue

**Key Rule:** AI never reveals future nodes during discussion

---

### Phase 4: Prediction Phase (Optional)
**UI State:** `phase = 'prediction'`

**Prompt:**
```
The student just learned about: [current node]
Context: [key concepts/tensions]
Next concept: [next node title]

Generate a prediction question that:
- For HISTORY: "Given [tensions], what might happen next?"
- For PSYCHOLOGY: "How does this theory apply to [scenario]?"
- For APES: "What effect would [change] have on this system?"
```

**Examples:**
- History: "The colonists were furious. How might they have responded?"
- Psych: "What happens when the dog just hears the bell?"
- APES: "How might deforestation affect carbon levels?"

**Evaluation:**
```
Student guess: "They probably boycotted British goods"
Actual next event: "Boston Tea Party"

Response:
- If close: "Great thinking! Actually, they did something even more dramatic..."
- If off: "Interesting idea, but what actually happened was..."
```

---

### Phase 5: Erasure / Recall
**Trigger:** Every 3-4 nodes completed

#### A. Partial Recall (Inline Words)
**UI State:** `phase = 'recall'`, `recallType = 'partial'`, `cameraMode = 'default'`

**Process:**
1. Select node with `masteryScore < 0.7`
2. Erase vocabulary words → show dashed underlines
3. Hide vocabulary definition boxes
4. AI asks: "Fill in the missing term"
5. Student types above the blank
6. Feedback:
   - ✅ Correct: Word animates in green, mastery += 0.2
   - ❌ Incorrect: Show correct answer, mastery -= 0.1

#### B. Full Recall (Entire Node)
**UI State:** `phase = 'recall'`, `recallType = 'full'`

**Two Variants:**

##### Forward Recall (Context from Previous)
```typescript
cameraMode = 'context-back'
contextMessage = "How did Bleeding Kansas lead to the rise of Southern radicals?"
```
- Camera zooms out to show previous + current node
- Current node replaced with blue dashed box + large text input
- Student writes free-form response
- AI grades on accuracy + coherence

##### Backward Recall (Context from Next)
```typescript
cameraMode = 'context-forward'
contextMessage = "What events in 1859 made the Democratic split inevitable?"
```
- Camera zooms out to show current + next node
- Same mechanics as forward recall

**AI Feedback (written on whiteboard):**
```
"Spot on! You nailed the connection. The violence in Kansas didn't 
just stay there—it showed the South that 'popular sovereignty' was 
a failure, directly fueling the rise of the Fire-eaters..."
```

---

### Phase 6: Checkpoint Quiz
**Trigger:** After completing 3-5 nodes or reaching natural breakpoint

**UI State:** `phase = 'quiz'`, `cameraMode = 'overview'`

**Display:**
- Full-screen modal overlay (black/50 backdrop blur)
- White card with rounded corners
- Quiz header: "Checkpoint Quiz" + brain icon
- Progress: "Question 1 of 3"
- Multiple choice buttons (A, B, C, D)
- Selected answer gets green border + checkmark

**Questions:**
- Mix of factual recall ("What year was the Boston Massacre?")
- Vocabulary definitions ("What is popular sovereignty?")
- Conceptual connections ("What caused the Democratic split?")

---

### Phase 7: Cumulative Review
**Trigger:** After 2-3 quiz cycles

**Process:**
1. Multi-node erasure (erase 3-5 elements from different nodes)
2. Rapid-fire questions
3. Optional FRQ: "In 2-3 sentences, explain how X led to Y"
4. AI uses DeepSeek to grade

**Mastery Check:**
- If `overallMastery >= 0.8` → Phase 8 (Completion)
- Else → return to weaker nodes

---

### Phase 8: Lesson Completion
**Trigger:** `overallMastery >= 0.8` for all nodes

**Animation:**
1. Camera zooms out (overview mode, scale = 0.4)
2. All nodes simultaneously fade in as connected graph
3. Erased content filled with student's answers (in "handwriting")
4. AI's original text shows faintly beneath

**Display Format by Subject:**

#### History: Linear Timeline
```
1770: Boston Massacre → 1773: Boston Tea Party → 1775: Lexington & Concord
✓ All events recalled correctly
Mastery: 87%
```

#### Psychology: Theory Map
```
      UCS (food) ──→ UCR (salivate)
          ↓
      CS (bell) ──→ CR (salivate)
          └─ [extinction] ✓
          └─ [spontaneous recovery] ✓
```

#### APES: Cycle Diagram
```
   ╭─→ Atmosphere CO₂ ←──╮
   │                     │
Photosynthesis      Respiration
   │                     │
   ↓                     ↑
 Plants → Animals → Decomposers
 
🎉 Carbon Cycle Mastered: 91%
```

**Actions:**
- Save to profile (convert nodes to flashcards)
- Generate PDF study guide
- Unlock subject-specific badge

---

## 🤖 DeepSeek Integration

### API Setup
```typescript
// lib/deepseek.ts
import OpenAI from 'openai';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

export async function generateTimeline(topic: string, subject: string) {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are a history teacher creating structured learning timelines.'
      },
      {
        role: 'user',
        content: `Generate a timeline for: ${topic} in ${subject}`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

### Structured Prompts

#### System Prompt (saved in DB)
```
You are Synapse, an AI tutor using the Socratic method.

Rules:
1. Never reveal future timeline nodes
2. Ask questions before giving answers
3. Use simple, chalk-like language
4. Relate abstract concepts to concrete examples
5. Praise correct answers, gently correct wrong ones
6. Write responses as if writing on a whiteboard (concise, visual)
```

---

## 🗄️ Database Schema

### New Tables
```prisma
model LessonState {
  id              String   @id @default(cuid())
  userId          String
  conversationId  String?  // Optional link to conversation
  subject         String   // "History", "Psychology", etc.
  topic           String   // "American Revolution"
  
  timeline        Json     // KnowledgeNode[]
  currentIndex    Int      @default(0)
  
  phase           String   @default("teaching")
  subPhase        String?
  cameraMode      String   @default("default")
  
  overallMastery  Float    @default(0)
  nodesCompleted  Int      @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id])
  conversation    Conversation? @relation(fields: [conversationId], references: [id])
  
  @@map("lesson_states")
}

model RecallAttempt {
  id         String   @id @default(cuid())
  userId     String
  lessonId   String
  nodeId     String
  question   String
  userAnswer String
  isCorrect  Boolean
  timestamp  DateTime @default(now())
  
  user       User         @relation(fields: [userId], references: [id])
  lesson     LessonState  @relation(fields: [lessonId], references: [id])
  
  @@map("recall_attempts")
}
```

---

## 🚀 Implementation Phases

### Phase A: Core Infrastructure (Week 1)
- [ ] Set up DeepSeek API integration
- [ ] Create `LessonState` and `RecallAttempt` models
- [ ] Build timeline generation endpoint (`/api/lessons/generate`)
- [ ] Migrate prototype whiteboard to production components

### Phase B: Teaching Flow (Week 2)
- [ ] Implement Phase 1 (Structure Generation)
- [ ] Implement Phase 1.5 (JIT Content Generation)
- [ ] Build Phase 2 (Teaching with sub-phases)
- [ ] Add chat interface for Phase 3 (Discussion)

### Phase C: Recall System (Week 3)
- [ ] Implement Phase 4 (Prediction) - optional
- [ ] Build Phase 5 partial recall (inline words)
- [ ] Build Phase 5 full recall (forward/backward context)
- [ ] Create mastery scoring algorithm

### Phase D: Assessment (Week 4)
- [ ] Implement Phase 6 (Checkpoint Quiz)
- [ ] Build Phase 7 (Cumulative Review)
- [ ] Create Phase 8 (Completion animation)
- [ ] Add PDF export

### Phase E: Polish (Week 5)
- [ ] Optimize AI prompts based on testing
- [ ] Add gamification (badges, streaks)
- [ ] Performance testing and caching
- [ ] User testing with real students

---

## 🎯 Success Metrics
- **Mastery Accuracy:** 80%+ of students reach 0.8 mastery
- **Engagement:** Average session length > 15 minutes
- **Retention:** Students return for cumulative review
- **AI Quality:** <5% hallucinations/errors

---

## 🔒 Considerations

### Performance
- **Cache timelines**: Store generated structures in Redis
- **Lazy load**: Only render visible nodes
- **WebSocket**: Real-time AI streaming responses
- **Pre-fetch**: Load next node content in background

### Edge Cases
- AI fails to generate JSON → Retry with fallback prompt
- Student stuck → Offer "hint" button (deducts mastery)
- Incomplete sessions → Auto-save every 30 seconds
- Network issues → Queue recall attempts, sync when online

### Privacy
- Anonymize data in DeepSeek logs
- Consider local LLM for sensitive topics
- Store student answers encrypted

---

## 📝 Demo Flow (Reference from Prototype)

```typescript
const demoSteps: DemoStep[] = [
  // Teaching: Kansas
  { index: 0, phase: "teaching", subPhase: "content" },
  { index: 0, phase: "teaching", subPhase: "question" },
  
  // Teaching: Union Shakes
  { index: 1, phase: "teaching", subPhase: "content" },
  { index: 1, phase: "teaching", subPhase: "question" },
  
  // Teaching: Election 1860
  { index: 2, phase: "teaching", subPhase: "content" },
  { index: 2, phase: "teaching", subPhase: "question" },
  
  // Partial Recall (Node 2)
  { index: 1, phase: "recall", recallType: "partial", erasedNodeId: "2" },
  { index: 1, phase: "recall", recallType: "partial", simulatedInput: "Fire-eaters", feedback: "correct" },
  
  // Forward Recall (Context from Node 1)
  { index: 1, phase: "recall", recallType: "full", cameraMode: "context-back", contextMessage: "How did Bleeding Kansas lead to..." },
  { index: 1, phase: "recall", simulatedInput: "It radicalized...", feedback: "correct" },
  { index: 1, phase: "recall", aiResponse: "Spot on! You nailed the connection..." },
  
  // Backward Recall (Context from Node 3)
  { index: 1, phase: "recall", recallType: "full", cameraMode: "context-forward", contextMessage: "What events made the split inevitable?" },
  { index: 1, phase: "recall", simulatedInput: "John Brown's raid...", feedback: "correct" },
  
  // Quiz
  { index: 2, phase: "quiz", quizQuestion: "Who raided Harpers Ferry?" },
  { index: 2, phase: "quiz", simulatedInput: "John Brown" },
];
```

---

## 🎨 Design Tokens (from Prototype)

### Typography
- **Chalk Font:** `font-chalk` (for handwritten teaching content)
- **Title:** 5xl, bold
- **Body:** 3xl, relaxed line-height
- **Vocabulary:** 2xl, bold

### Colors
- **Node Background:** White
- **Vocabulary Highlight:** Yellow-200 (marker effect, -rotate-1)
- **Year Badge:** Blue-50 bg, Blue-600 text
- **Vocabulary Box:** Yellow-50 bg, Yellow-300 border-left
- **Recall Box:** Blue-100 border, Blue-300 dashed
- **Correct Answer:** Green-600
- **Grid:** Black at 3% opacity

### Animations
- **Typewriter:** 3 chars every 20ms
- **Camera Pan:** 1.2s, easeInOut
- **Highlight Expand:** scaleX from 0 to 1, origin left
- **Fade In:** opacity 0 to 1, 0.5s

---

## Next Steps
1. Review this updated plan
2. Migrate prototype components to production
3. Set up DeepSeek API integration
4. Build backend endpoints
5. Begin Phase A implementation
