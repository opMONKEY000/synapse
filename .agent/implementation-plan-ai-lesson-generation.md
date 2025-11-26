# AI Lesson Generation System - Implementation Plan

## Goal
Implement a two-phase AI lesson generation system using DeepSeek that creates dynamic, memory-focused lesson plans for any subject. The system uses a smart pre-loading strategy:

- **Phase 1 (Structure Generation)**: Instantly generate a lightweight lesson structure with only node titles and vocabulary words
- **Phase 2 (On-Demand Content)**: Generate full node content (summaries, definitions, questions) as the user progresses through the lesson, pre-loading one node ahead

This approach eliminates waiting time while maintaining the fluid, real-time learning experience with **interactive Q&A capabilities**.

---

## User Review Required

### ⚠️ IMPORTANT: Scope Clarification
This implementation focuses exclusively on **memory-based subjects** (history, psychology, APES, biology, etc.) where learning involves retaining facts, concepts, vocabulary, and causal relationships. Math and physics-style problem-solving subjects will be handled in a separate future implementation.

### ⚠️ IMPORTANT: API Choice
This plan assumes using **DeepSeek's API** for lesson generation. Please confirm:
- Do you have a DeepSeek API key, or should we use OpenAI (which is already in your `env.example.txt`)?
- If DeepSeek, which endpoint/model should we use (e.g., `deepseek-chat`)?

### ⚠️ WARNING: Knowledge Graph Storage
Currently, there's no database model for storing generated lessons. This plan includes adding a `Lesson` and `KnowledgeNode` model to persist generated content. **This means running a new Prisma migration.**

---

## Architecture: Two-Phase Generation

### Phase 1: Structure Generation (Fast)
**When**: User clicks "Generate Lesson" on topic input

**AI Generates**:
- Node titles (concise, 2-4 words)
- Vocabulary terms only (no definitions yet)
- Node count based on difficulty:
  - **Beginner**: 5-8 nodes
  - **Intermediate**: 10-15 nodes
  - **Advanced**: 18-25 nodes
- Metadata hints (dates, locations)

**Purpose**: Give user immediate visual structure and start lesson instantly

### Phase 2: Content Generation (On-Demand)
**When**: User reaches each node during lesson

**AI Generates**:
- Full summary (2-3 sentences)
- Vocabulary definitions
- Thinking question
- Complete metadata

**Strategy**: Pre-load content for current node + 1 node ahead to ensure zero waiting

---

## Interactive Learning Features

Based on the prototype implementation, the system supports **real-time Q&A interaction** during the teaching phase:

### Teaching Phase Interaction Flow

1. **Content Display**
   - Node summary appears with typewriter effect
   - Vocabulary terms are highlighted inline
   - Vocabulary definitions appear below
   - "Do you understand?" prompt appears

2. **User Question (Optional)**
   - User can ask clarifying questions at any time
   - Questions appear with a blue dot indicator
   - Example: "Wait, what does 'popular sovereignty' actually mean in practice?"

3. **AI Response**
   - AI provides contextual answers to user questions
   - Responses appear with a green dot indicator
   - Typewriter effect for natural conversation feel
   - Example: "Great question! It meant settlers themselves voted whether to allow slavery when applying for statehood..."

4. **Continue Flow**
   - After AI response, "Do you understand?" prompt reappears
   - User can continue to next section or ask more questions

5. **Thinking Question**
   - Forward-looking question that bridges to next concept
   - User provides written response
   - Example: "How did the violence in Kansas set the stage for the South's reaction to John Brown?"

6. **Thinking Feedback**
   - AI feedback on thinking question appears **above the next node's title**
   - Validates understanding before moving forward
   - Example: "Exactly! The violence in Kansas showed both sides that peaceful resolution was impossible..."

### Recall Phase Features

1. **Partial Recall (Inline)**
   - Specific vocabulary terms are blanked out
   - User fills in missing terms
   - Immediate feedback with grade (F to A+)
   - **Mastery score (0.0-1.0) saved to database**

2. **Full Recall (Context-Based)**
   - Entire node is erased
   - Camera shows context (previous or next node)
   - Contextual prompt guides recall
   - User reconstructs full explanation
   - AI provides detailed feedback with grade
   - **Mastery score (0.0-1.0) saved to database**

3. **Mastery Tracking**
   - Each recall attempt generates a mastery score from 0.0 (no understanding) to 1.0 (perfect mastery)
   - Scores are stored per user, per node, per attempt
   - Enables spaced repetition and adaptive learning
   - Tracks learning progress over time

### Visual Indicators

- **Blue dot**: User questions/input
- **Green dot**: AI responses/feedback
- **Grades**: F to A+ displayed for recall answers
- **Underlines**: 
  - Wavy amber: "Do you understand?" prompts
  - Sky blue: Vocabulary terms
  - Rose: "Think:" label for thinking questions

---

## Proposed Changes

### Backend - API Infrastructure

#### [NEW] `lib/deepseek.ts`
Create a DeepSeek API client using the `openai` package (which supports OpenAI-compatible APIs). This will handle:
- API configuration with DeepSeek endpoint
- Structured output for knowledge graph generation
- Streaming support for real-time lesson building
- Error handling and retries

```typescript
import OpenAI from 'openai';

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1', // DeepSeek endpoint
});
```

#### [MODIFY] `prisma/schema.prisma`
Add three new models to support two-phase generation and mastery tracking:

**`Lesson` Model**:
- Links to user and subject (NOT subject selector - subject comes from dashboard context)
- Stores topic, difficulty level (beginner, intermediate, advanced)
- Tracks overall status (GENERATING_STRUCTURE, STRUCTURE_COMPLETE, IN_PROGRESS, COMPLETED)
- createdAt, updatedAt timestamps

**`KnowledgeNode` Model**:
- **Status field**: `PENDING_CONTENT` (only has title/vocab terms) or `COMPLETE` (full content generated)
- **Structure fields** (always populated): 
  - `title`
  - `vocabularyTerms` (array of strings)
  - `metadataHint`
  - `order`
- **Content fields** (populated on-demand): 
  - `summary`
  - `vocabulary` (JSON array of `{term, definition}`)
  - `thinkingQuestion`
  - `metadata` (JSON)
- Links to parent `Lesson` with cascading delete
- Order field to maintain sequence (0-indexed)

**`NodeMastery` Model** (NEW):
- Links to user and knowledge node
- **`masteryScore`**: Float (0.0 to 1.0) representing understanding level
- **`recallType`**: Enum (PARTIAL, FULL_FORWARD, FULL_BACKWARD) - type of recall performed
- **`userResponse`**: Text - what the user answered
- **`aiEvaluation`**: Text - AI's evaluation and feedback
- **`grade`**: String - letter grade (F to A+)
- **`attemptedAt`**: DateTime - when this recall was attempted
- Composite unique constraint on (userId, nodeId, attemptedAt) to allow multiple attempts

This allows users to:
- Save and revisit generated lessons
- Track learning progress across lessons
- Build a library of AI-generated content
- **Monitor mastery levels for each concept**
- **Identify weak areas that need review**
- **Enable spaced repetition algorithms**

#### [NEW] `app/api/lessons/generate-structure/route.ts`
**Phase 1 Endpoint** - Fast structure generation

POST endpoint that:
- Accepts: `{ subjectId, topic, difficultyLevel }` (difficulty determines node count)
- Validates user authentication and subject access
- Maps difficulty to node count:
  - `beginner`: 5-8 nodes
  - `intermediate`: 10-15 nodes
  - `advanced`: 18-25 nodes
- Calls DeepSeek with lightweight structure prompt
- Returns: Lesson ID + array of node structures (titles + vocab terms only)
- Saves lesson structure to database with nodes in `PENDING_CONTENT` status

**Prompt Structure**:

```typescript
// System prompt
"You are an expert curriculum designer for {subject}. Create a logical, sequential learning path where each concept naturally flows into the next."

// User prompt
"Topic: {topic}
Difficulty: {difficulty}
Create {nodeCount} connected concept nodes that build on each other.

CRITICAL: Each node should create a clear bridge to the next node. The sequence should feel like a story unfolding, where understanding one concept naturally raises questions about the next.

For each node, provide ONLY:
1. Title (2-4 words, descriptive)
2. Vocabulary terms (2-4 key terms, NO definitions)
3. Brief metadata hint (e.g., '1776' for history, 'Pavlov' for psychology)

Output format: JSON array
[
  { title: string, vocabularyTerms: string[], metadataHint: string },
  ...
]"
```

#### [NEW] `app/api/lessons/[lessonId]/nodes/[nodeId]/generate/route.ts`
**Phase 2 Endpoint** - On-demand content generation

POST endpoint that:
- Accepts: `{ lessonId, nodeId }` from URL params
- Validates user owns this lesson
- Fetches node structure (title + vocab terms) from database
- Calls DeepSeek to generate full content for THIS node only
- Returns: Complete node content (summary, vocab definitions, thinking question, full metadata)
- Updates node status to `COMPLETE` in database

**Prompt Structure**:

```typescript
// System prompt
"You are a master teacher for {subject}. Expand this concept with rich detail and create bridges to the next concept."

// User prompt (Two variations: mid-lesson vs. final node)

// For non-final nodes:
"Lesson Topic: {lessonTopic}
Current Node: {nodeTitle}
Previous Node: {previousNodeTitle} (for context)
Next Node: {nextNodeTitle} (this is where we're heading)
Vocabulary Terms to Define: {vocabularyTerms}

Generate:
1. Summary (2-3 sentences explaining this concept and how it connects to the previous node)
2. Vocabulary Definitions (clear, concise definitions for each term)
3. Thinking Question (ONE question that helps the student see how this concept leads naturally into '{nextNodeTitle}'. The question should create curiosity about what comes next.)
4. Complete Metadata (dates, locations, key figures relevant to this concept)

Output format: JSON object
{
  summary: string,
  vocabulary: [{ term: string, definition: string }],
  thinkingQuestion: string,
  metadata: { badge?: string, location?: string, keyFigure?: string }
}"

// For final node:
"Lesson Topic: {lessonTopic}
Current Node: {nodeTitle} (FINAL NODE)
Previous Node: {previousNodeTitle}
Vocabulary Terms to Define: {vocabularyTerms}

Generate:
1. Summary (2-3 sentences explaining this concept and how it connects to the previous node)
2. Vocabulary Definitions (clear, concise definitions for each term)
3. Thinking Question (ONE question that helps the student synthesize and wrap up the key concepts from the entire lesson. Start with something like 'Now that we've covered...' or 'Looking back at the whole story...')
4. Complete Metadata (dates, locations, key figures relevant to this concept)

Output format: JSON object
{
  summary: string,
  vocabulary: [{ term: string, definition: string }],
  thinkingQuestion: string,
  metadata: { badge?: string, location?: string, keyFigure?: string }
}"
```

#### [NEW] `app/api/lessons/[lessonId]/nodes/[nodeId]/ask/route.ts`
**Interactive Q&A Endpoint** - Handle user questions during teaching phase

POST endpoint that:
- Accepts: `{ lessonId, nodeId, question }` from request body
- Validates user owns this lesson
- Fetches current node content and lesson context
- Calls DeepSeek to generate contextual answer
- Returns: AI response to user's question

**Prompt Structure**:

```typescript
// System prompt
"You are a helpful tutor for {subject}. Answer the student's question clearly and concisely, relating it back to the current concept."

// User prompt
"Lesson Topic: {lessonTopic}
Current Node: {nodeTitle}
Node Summary: {nodeSummary}
Vocabulary: {vocabularyTerms}

Student Question: {userQuestion}

Provide a clear, conversational answer (2-3 sentences) that:
1. Directly addresses their question
2. Relates back to the current concept
3. Uses simple language
4. Encourages further learning

Output format: Plain text response"
```

#### [NEW] `app/api/lessons/[lessonId]/nodes/[nodeId]/thinking-feedback/route.ts`
**Thinking Question Feedback Endpoint** - Evaluate user's thinking response

POST endpoint that:
- Accepts: `{ lessonId, nodeId, userResponse }` from request body
- Validates user owns this lesson
- Fetches thinking question and correct context
- Calls DeepSeek to evaluate response and provide feedback
- Returns: Feedback message to display above next node

**Prompt Structure**:

```typescript
// System prompt
"You are an encouraging tutor for {subject}. Evaluate the student's thinking and provide brief, positive feedback."

// User prompt
"Lesson Topic: {lessonTopic}
Current Node: {nodeTitle}
Thinking Question: {thinkingQuestion}
Student Response: {userResponse}

Evaluate the student's response and provide brief feedback (1-2 sentences) that:
1. Validates correct understanding
2. Gently corrects misconceptions if needed
3. Bridges to the next concept
4. Is encouraging and positive

Output format: Plain text feedback"
```

#### [NEW] `app/api/lessons/[lessonId]/nodes/[nodeId]/recall/route.ts`
**Recall Evaluation Endpoint** - Evaluate recall attempts and calculate mastery score

POST endpoint that:
- Accepts: `{ lessonId, nodeId, recallType, userResponse }` from request body
  - `recallType`: "partial" | "full-forward" | "full-backward"
  - `userResponse`: User's answer (filled-in term or full explanation)
- Validates user owns this lesson
- Fetches node content for comparison
- Calls DeepSeek to evaluate response quality
- Calculates mastery score (0.0-1.0)
- Saves `NodeMastery` record to database
- Returns: `{ grade, masteryScore, feedback, aiEvaluation }`

**Prompt Structure**:

```typescript
// System prompt
"You are an expert evaluator for {subject}. Assess the student's recall accuracy and understanding depth."

// User prompt (varies by recall type)

// For PARTIAL recall (vocabulary):
"Lesson Topic: {lessonTopic}
Node: {nodeTitle}
Vocabulary Term: {term}
Correct Definition: {correctDefinition}
Student Answer: {userResponse}

Evaluate the student's answer and provide:
1. Mastery Score (0.0 to 1.0, where 1.0 = perfect match, 0.7-0.9 = good understanding with minor errors, 0.4-0.6 = partial understanding, 0.0-0.3 = incorrect)
2. Letter Grade (F, D, C, B-, B, B+, A-, A, A+)
3. Brief Feedback (1 sentence explaining the score)

Output format: JSON
{
  masteryScore: number,
  grade: string,
  feedback: string
}"

// For FULL recall (forward/backward):
"Lesson Topic: {lessonTopic}
Node: {nodeTitle}
Correct Summary: {correctSummary}
Key Concepts: {vocabularyTerms}
Student Recall: {userResponse}
Context: {contextType} (previous node: {contextNodeTitle})

Evaluate the student's recall and provide:
1. Mastery Score (0.0 to 1.0):
   - 1.0: Captures all key concepts with accurate causal connections
   - 0.7-0.9: Captures most concepts, minor gaps in connections
   - 0.4-0.6: Captures some concepts but missing key details
   - 0.0-0.3: Significant gaps or misconceptions
2. Letter Grade (F to A+)
3. Detailed Feedback (2-3 sentences):
   - What they got right
   - What they missed (if anything)
   - Encouragement

Output format: JSON
{
  masteryScore: number,
  grade: string,
  feedback: string
}"
```

---

### Frontend - Live Lesson Generation

#### [NEW] `app/subjects/[subjectId]/lessons/new/page.tsx`
Create a minimal lesson generation form with whiteboard styling:

- Topic input (free text: "American Civil War", "Classical Conditioning")
- Difficulty slider (Beginner → Intermediate → Advanced)
- Displays estimated node count:
  - Beginner (5-8)
  - Intermediate (10-15)
  - Advanced (18-25)
- Generate button that calls Phase 1 API

**Flow**:
1. User enters topic + selects difficulty
2. Clicks "Generate" → calls `/api/lessons/generate-structure`
3. Structure returns instantly (~2-3 seconds)
4. Redirects to lesson page at `/subjects/[subjectId]/lessons/[lessonId]`
5. Lesson begins immediately with Phase 2 content loading node-by-node

**UI**: Follows whiteboard aesthetic with hand-drawn borders, marker buttons, and Caveat font for emphasis.

**Subject Context**: Subject ID comes from URL params - lessons are always created within a subject. No subject selector needed.

#### [NEW] `app/subjects/[subjectId]/lessons/[lessonId]/page.tsx`
The main lesson experience page that:

- Fetches lesson structure from database (all node titles + vocab terms)
- Renders `WhiteboardCanvas` with structure
- Triggers Phase 2 content generation as user progresses:
  - When entering node N, check if content is loaded
  - If `PENDING_CONTENT`, call `/api/lessons/[id]/nodes/[nodeId]/generate`
  - Pre-load node N+1 content in background
- Displays loading state only on first node (subsequent nodes pre-loaded)
- **Handles interactive Q&A**:
  - Manages user question input state
  - Calls `/ask` endpoint when user asks question
  - Displays AI responses in conversation flow
  - Manages thinking question responses
  - Calls `/thinking-feedback` endpoint for evaluation
- **Handles recall mode**:
  - Manages recall state (partial/full, forward/backward)
  - Calls `/recall` endpoint when user submits recall answer
  - Displays mastery score and grade
  - Saves mastery data to database for progress tracking

**Sequential Display**: Nodes are revealed one-by-one as the user progresses (already matches prototype behavior). The full timeline is NOT shown at once.

#### [MODIFY] `components/lesson/whiteboard-canvas.tsx`
Currently works with hardcoded 3-node mock data. Changes needed:

✅ **Already supports sequential display** (nodes revealed one-by-one, not all at once)
✅ **Accept dynamic node data via props** (already done)
✅ **Interactive Q&A flow implemented** (user questions, AI responses, thinking questions)

**Additional changes needed**:
- Handle variable node counts (5-25 nodes instead of hardcoded 3)
- Dynamically calculate node positions based on actual node count
- Add loading state when node content is `PENDING_CONTENT`:
  - Show skeleton for summary/definitions
  - Trigger content generation API call
  - Smoothly transition to full content when loaded
- Implement pre-loading logic: when on node N, ensure node N+1 content is generating
- Connect interactive Q&A to real API endpoints (currently demo state)
- Add chat interface at bottom for persistent question access

**Interactive Features to Preserve**:
- Sub-phase management: `content` → `user-question` → `ai-answer` → `continue` → `question` → `user-thinking-response`
- Visual indicators: blue dots (user), green dots (AI)
- Thinking feedback display above next node title
- Typewriter effects for natural conversation
- "Do you understand?" prompts with continue buttons

---

## Environment Configuration

#### [MODIFY] `env.example.txt`
Add DeepSeek API configuration:

```bash
# DeepSeek API
DEEPSEEK_API_KEY=""
DEEPSEEK_MODEL="deepseek-chat" # or specific model name
```

---

## Verification Plan

### Automated Tests
Currently, there are no automated tests in this project. This implementation will be verified manually and through browser testing.

### Manual Verification

#### 1. Database Migration Test
```bash
# Run from project root
pnpm prisma generate
pnpm prisma migrate dev --name add_lesson_models
```
**Expected**: Migration succeeds, `Lesson` and `KnowledgeNode` models are created.

#### 2. Phase 1 API Test - Structure Generation
**Prerequisites**:
- DeepSeek API key added to `.env`
- Dev server running (`pnpm run dev`)
- At least one subject created in dashboard

**Steps**:
1. POST to `http://localhost:3000/api/lessons/generate-structure`
2. Body:
   ```json
   {
     "subjectId": "<subject-id>",
     "topic": "The French Revolution",
     "difficultyLevel": "intermediate"
   }
   ```
3. Measure response time
4. Check database for lesson with `STRUCTURE_COMPLETE` status

**Expected**:
- Response returns in <3 seconds
- Returns: `{ lessonId, nodes: [{ id, title, vocabularyTerms, metadataHint }] }`
- Node count is 10-15 (intermediate difficulty)
- All nodes have status `PENDING_CONTENT` in database

#### 3. Phase 2 API Test - On-Demand Content
**Prerequisites**: Lesson structure created from test #2

**Steps**:
1. POST to `http://localhost:3000/api/lessons/[lessonId]/nodes/[firstNodeId]/generate`
2. Measure response time
3. Verify returned content structure
4. Check database that node status changed to `COMPLETE`

**Expected**:
- Response in <4 seconds
- Returns: `{ summary, vocabulary: [{ term, definition }], thinkingQuestion, metadata }`
- Vocabulary definitions match the terms from structure
- Thinking question connects to overall topic

#### 4. Interactive Q&A Test
**Prerequisites**: Lesson with at least one complete node

**Steps**:
1. POST to `http://localhost:3000/api/lessons/[lessonId]/nodes/[nodeId]/ask`
2. Body:
   ```json
   {
     "question": "What does 'popular sovereignty' mean in practice?"
   }
   ```
3. Verify response quality and relevance

**Expected**:
- Response in <3 seconds
- Answer is contextual and relates to current node
- Response is 2-3 sentences, conversational tone

#### 5. Thinking Feedback Test
**Prerequisites**: Lesson with complete node and thinking question

**Steps**:
1. POST to `http://localhost:3000/api/lessons/[lessonId]/nodes/[nodeId]/thinking-feedback`
2. Body:
   ```json
   {
     "userResponse": "The violence proved compromise was dead and made Southerners more radical."
   }
   ```
3. Verify feedback quality

**Expected**:
- Response in <3 seconds
- Feedback validates understanding
- Bridges to next concept
- Encouraging tone

#### 5a. Recall Evaluation Test - Partial Recall
**Prerequisites**: Lesson with complete node

**Steps**:
1. POST to `http://localhost:3000/api/lessons/[lessonId]/nodes/[nodeId]/recall`
2. Body:
   ```json
   {
     "recallType": "partial",
     "userResponse": "popular sovereignty"
   }
   ```
3. Verify mastery score calculation
4. Check database for `NodeMastery` record

**Expected**:
- Response in <3 seconds
- Returns: `{ masteryScore: 0.0-1.0, grade: "A+", feedback: "...", aiEvaluation: "..." }`
- `NodeMastery` record created in database with correct score
- Mastery score reflects answer quality (1.0 for perfect match)

#### 5b. Recall Evaluation Test - Full Recall
**Prerequisites**: Lesson with complete node

**Steps**:
1. POST to `http://localhost:3000/api/lessons/[lessonId]/nodes/[nodeId]/recall`
2. Body:
   ```json
   {
     "recallType": "full-forward",
     "userResponse": "After Bleeding Kansas, the South felt surrounded. Fire-eaters warned that the North wanted to destroy slavery. John Brown's raid proved it to them."
   }
   ```
3. Verify mastery score reflects understanding depth
4. Check database for `NodeMastery` record

**Expected**:
- Response in <4 seconds
- Returns mastery score based on:
  - Key concepts captured
  - Causal connections explained
  - Accuracy of details
- Grade matches mastery level (A/A+ for 0.9-1.0, B for 0.7-0.8, etc.)
- Feedback highlights strengths and gaps
- Database record includes full evaluation

#### 6. Frontend Integration Test - Two-Phase Flow
**Prerequisites**: At least one subject exists in dashboard

**Steps**:
1. Navigate to `/subjects/[subjectId]/lessons/new`
2. Enter topic: "Classical Conditioning"
3. Set difficulty: Beginner
4. Click "Generate Lesson"
5. Observe redirect to lesson page
6. Watch as first node content loads
7. Progress to second node

**Expected**:
- Structure generation completes in <3 seconds
- Redirected to lesson page immediately
- First node shows brief loading state (<2 seconds) then displays full content
- Second node loads instantly (pre-loaded while viewing first)
- Subsequent nodes load seamlessly with zero waiting

#### 7. Interactive Q&A Flow Test
**Prerequisites**: Generated lesson in progress

**Steps**:
1. During teaching phase, type question in chat interface
2. Submit question
3. Observe AI response
4. Click "Yes, continue"
5. Answer thinking question
6. Observe feedback above next node

**Expected**:
- Question appears with blue dot
- AI response appears with green dot, typewriter effect
- "Do you understand?" prompt reappears after response
- Thinking feedback appears above next node title
- Smooth conversation flow throughout

#### 7a. Recall Mode Mastery Tracking Test
**Prerequisites**: Generated lesson with completed nodes

**Steps**:
1. Enter recall mode (partial or full)
2. Submit answer for a node
3. Observe grade and mastery score display
4. Check database for `NodeMastery` record
5. Attempt same node again
6. Verify new mastery record is created

**Expected**:
- Mastery score (0.0-1.0) displays after submission
- Grade (F to A+) matches mastery level
- Database contains `NodeMastery` record with:
  - Correct userId, nodeId
  - Mastery score
  - Recall type
  - User response
  - AI evaluation
  - Timestamp
- Multiple attempts create separate records
- Can track improvement over time

#### 8. Prototype Live Mode Test
**Steps**:
1. Generate a lesson (via test #6)
2. Navigate to the generated lesson (e.g., `/prototype/lesson?id=<lesson_id>`)
3. Verify all prototype features work:
   - Teaching phase displays content correctly
   - Vocabulary terms are highlighted
   - Thinking questions appear
   - Metadata badges render (dates, locations)
   - Interactive Q&A works
   - Thinking feedback displays correctly

**Expected**:
- All whiteboard animations work
- AI-generated content renders correctly
- No hardcoded mock data visible
- Interactive features function properly

#### 9. Subject Variety Test
Test lesson generation across multiple memory-based subjects:

| Subject | Topic | Expected Content |
|---------|-------|------------------|
| History | American Civil War | Dates, locations, key figures, causal chain of events |
| Psychology | Cognitive Biases | Definitions, examples, applications |
| APES (Environmental Science) | Carbon Cycle | Processes, vocabulary, ecosystem connections |
| Biology | Cell Division | Phases, vocabulary, visual descriptions |

**Steps**: For each subject, generate a 3-node lesson and verify:
- Vocabulary terms are accurate and well-defined
- Summaries are concise and causal
- Thinking questions connect nodes conceptually
- Metadata is relevant to subject
- Interactive Q&A provides contextual answers

#### 10. Streaming Performance Test
**Steps**:
1. Generate a large lesson (8-10 nodes)
2. Monitor:
   - Time to first node (should be <5 seconds)
   - Time between nodes
   - Total generation time
3. Check browser network tab for streaming chunks

**Expected**:
- Nodes stream incrementally (not all at once)
- No frontend blocking during generation
- Smooth UI updates

---

## Notes

- **Two-phase architecture** eliminates user waiting: structure generated instantly, content loaded on-demand
- **Pre-loading strategy** (N+1 node) ensures seamless progression through 20-25 node lessons
- **Difficulty level** automatically determines node count (no separate selector):
  - Beginner: 5-8 nodes
  - Intermediate: 10-15 nodes
  - Advanced: 18-25 nodes
- **Subject context** comes from dashboard (lessons created within subjects, not standalone)
- The system uses **structured JSON output** to ensure consistent formatting
- **Vocabulary terms** identified in Phase 1, definitions generated in Phase 2
- **Thinking questions** are forward-looking bridges:
  - For nodes 1 through N-1, questions hint at the next concept
  - For the final node, the question synthesizes the entire lesson
- The **knowledge graph is linear and sequential** (node A → B → C) - nodes revealed one at a time with each concept flowing naturally into the next
- **Interactive Q&A** allows students to ask clarifying questions at any point during teaching
- **Thinking feedback** validates understanding before progressing to next concept
- **Visual conversation flow** with blue dots (user) and green dots (AI) creates natural dialogue
- **Mastery tracking** with 0.0-1.0 scores enables:
  - Progress monitoring across all concepts
  - Identification of weak areas needing review
  - Spaced repetition scheduling
  - Adaptive difficulty adjustment
  - Long-term retention analytics
- **Recall evaluation** uses AI to assess:
  - Accuracy of recalled information
  - Depth of understanding (not just memorization)
  - Causal reasoning and connections
  - Completeness of explanation
- Future enhancements:
  - Support for branching narratives or choice-based learning paths
  - Spaced repetition algorithm based on mastery scores
  - Personalized review sessions targeting low-mastery nodes
  - Progress dashboards showing mastery trends over time

---

## Implementation Priority

### Phase 1: Core Infrastructure (Week 1)
1. Database schema updates (Prisma migration)
2. DeepSeek API client setup
3. Structure generation endpoint
4. Content generation endpoint

### Phase 2: Interactive Features (Week 2)
1. Q&A endpoint implementation
2. Thinking feedback endpoint
3. **Recall evaluation endpoint with mastery scoring**
4. Frontend lesson creation page
5. Frontend lesson display page

### Phase 3: Integration & Polish (Week 3)
1. Connect whiteboard canvas to real APIs
2. Implement pre-loading logic
3. Add loading states and error handling
4. Performance optimization

### Phase 4: Testing & Refinement (Week 4)
1. Manual verification tests
2. Subject variety testing
3. Performance testing
4. User experience refinement
