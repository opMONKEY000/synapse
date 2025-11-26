# Memory-Driven Lessons: Complete Specification

## Overview

Memory-driven lessons in Synapse use an AI-powered whiteboard interface to teach concepts through a cycle of **teaching**, **partial recall**, and **full recall**. The system implements spaced repetition principles with immediate feedback to maximize retention.

---

## Core Principles

### 1. The AI Lives on the Whiteboard
- All communication happens through handwritten text on the whiteboard
- No chat bubbles, sidebars, or separate UI panels for AI responses
- The whiteboard is a shared space where AI and student collaborate
- Everything appears as if written/drawn in real-time

### 2. Spaced Repetition Through Cycles
- Lessons are divided into nodes (5-25 nodes per lesson)
- After every 3 nodes, a recall cycle begins
- Nodes are tested at increasing intervals (1 back, 2 back, 3 back)
- Middle nodes get retested for reinforcement

### 3. Two Types of Recall
- **Partial Recall**: Fill-in-the-blank vocabulary practice (no grade)
- **Full Recall**: Complete concept reconstruction (graded F to A+)

### 4. Camera Lock During Recall
- View is locked to prevent panning/zooming during recall
- Only the recall node and hint nodes are visible
- Prevents cheating by looking at other nodes

---

## Lesson Structure

### Node Composition

Each node contains:
- **Title**: Concept name
- **Main Text**: 2-4 sentences explaining the concept
- **Vocabulary**: 3-5 key terms highlighted inline in the main text
- **Thinking Question**: Optional prompt to engage deeper thinking
- **Diagrams**: (Future feature) Visual representations

**Example Node:**
```
Node 2: Light-Dependent Reactions
═══════════════════════════════

The light-dependent reactions occur in the thylakoid 
membranes of the chloroplast. Light energy excites 
electrons in chlorophyll, which then move through the 
electron transport chain. This process produces ATP 
and NADPH, which are used in the Calvin cycle.

Vocabulary:
• thylakoid - Membrane structure where light reactions occur
• chloroplast - Organelle where photosynthesis happens
• chlorophyll - Green pigment that absorbs light
• ATP - Energy currency of the cell
• NADPH - Electron carrier molecule

Thinking Question:
Why do you think plants appear green to our eyes?
```

### Lesson Flow

```
Teaching Phase:
Node A → Node B → Node C

Recall Cycle 1:
├─ Node B: Partial Recall (1 node back)
├─ Node A: Full Recall (2 nodes back, showing Node B)
└─ Node C: Full Recall (current node, showing Node B)

Teaching Phase:
Node D → Node E → Node F

Recall Cycle 2:
├─ Node B: Full Recall (3 nodes back, showing Nodes A & C)
├─ Node E: Partial Recall (1 node back)
├─ Node D: Full Recall (2 nodes back, showing Node E)
└─ Node F: Full Recall (current node, showing Node E)

Teaching Phase:
Node G → Node H → Node I

Recall Cycle 3:
├─ Node E: Full Recall (3 nodes back, showing Nodes D & F)
├─ Node H: Partial Recall (1 node back)
├─ Node G: Full Recall (2 nodes back, showing Node H)
└─ Node I: Full Recall (current node, showing Node H)

[Pattern continues...]
```

### Last Cycle Special Case

When the lesson ends on a cycle (e.g., last 3 nodes are A, B, C):

```
Final Recall Cycle:
├─ Node B: Partial Recall
├─ Node A: Full Recall (showing Node B)
├─ Node C: Full Recall (showing Node B)
└─ Node B: Full Reconstruction (no hints, comprehensive test)
```

The middle node gets a final comprehensive test to ensure mastery.

---

## Teaching Phase

### Visual Presentation

1. **Camera pans** to the node's position on the whiteboard
2. **Content appears** stroke-by-stroke as if being written
3. **Vocabulary terms** are underlined/highlighted in the main text
4. **Thinking question** appears in a corner or below main text

### User Interaction

- **Read the content** at their own pace
- **Hover/click vocabulary** to see definitions (popup card style)
- **Answer thinking question** (optional, typed response)
  - AI provides brief feedback if answered
  - Not graded, just for engagement
- **Click "Next"** to continue to next node

### Camera Behavior

- **Auto-locked** during content presentation
- **May allow limited pan/zoom** to explore current node (optional)
- **Cannot pan** to other nodes (prevents spoilers)

---

## Partial Recall Phase

### Purpose
Test vocabulary retention in context without full concept reconstruction.

### Process

1. **Camera locks** to the node being recalled
2. **Vocabulary terms erase** from main text, leaving blanks: `_______`
3. **Rest of content stays visible** (context preserved)
4. **User clicks a blank** → Input field appears inline
5. **User types the term** → Presses Enter
6. **Immediate feedback**: Blank turns green (✓) or red (✗)
7. **Repeat** for all blanks in any order
8. **No grade assigned** (just immediate right/wrong feedback)

### Visual Example

**Before (Original Node):**
```
The light-dependent reactions occur in the thylakoid 
membranes of the chloroplast. Light energy excites 
electrons in chlorophyll, which then move through...
```

**During Partial Recall:**
```
Partial Recall: Node B
──────────────────────

The light-dependent reactions occur in the _______ 
membranes of the _______. Light energy excites 
electrons in _______, which then move through the 
electron transport chain. This process produces _____ 
and ______, which are used in the Calvin cycle.

[Click any blank to fill in]
```

**After User Fills In:**
```
The light-dependent reactions occur in the thylakoid ✓
membranes of the chloroplast ✓. Light energy excites 
electrons in chlorophyll ✓, which then move through the 
electron transport chain. This process produces ATP ✓
and NADH ✗, which are used in the Calvin cycle.

[Correct answer was: NADPH]
```

### Interaction Details

- **Click blank** → Inline input field appears
- **Type answer** → Press Enter to submit
- **Instant feedback** → Green checkmark or red X
- **If wrong** → Correct answer shows briefly below the blank
- **Move to next blank** → Click another blank or auto-focus next
- **No grade** → Just practice, not scored
- **Click "Continue"** when all blanks attempted

---

## Full Recall Phase

### Purpose
Test deep understanding and ability to reconstruct concepts from memory.

### Process

1. **Camera locks** to show recall node + hint node(s)
2. **Recall node content erases completely**
3. **Hint node(s) stay fully visible** for reference
4. **Recall question appears** in the empty space
5. **User writes 1-2 sentence summary** from memory
6. **Submit answer**
7. **AI writes feedback** on the whiteboard
8. **Grade assigned** (F, D, C, B, A, A+)

### Visual Example

**Full Recall of Node A (with Node B as hint):**
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  ┌──────────────────┐     ┌──────────────────┐       │
│  │ Recall Node A:   │     │ Node B (Hint):   │       │
│  │                  │     │                  │       │
│  │ In your own      │     │ Light-Dependent  │       │
│  │ words, explain   │     │ Reactions        │       │
│  │ what             │     │                  │       │
│  │ photosynthesis   │     │ The light-       │       │
│  │ is.              │     │ dependent        │       │
│  │                  │     │ reactions occur  │       │
│  │ ┌──────────────┐ │     │ in the thylakoid │       │
│  │ │ [Text input] │ │     │ membranes...     │       │
│  │ │              │ │     │                  │       │
│  │ └──────────────┘ │     │ [Full content]   │       │
│  │                  │     │                  │       │
│  │ [Submit]         │     │                  │       │
│  └──────────────────┘     └──────────────────┘       │
│                                                        │
│  [Camera locked - cannot pan to other nodes]          │
└────────────────────────────────────────────────────────┘
```

**After Submission (AI Feedback):**
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  Your Answer:                                          │
│  "Photosynthesis is when plants use sunlight to       │
│  make food and release oxygen."                        │
│                                                        │
│  [AI's handwritten feedback appears below]            │
│                                                        │
│  Great start! ✓                                        │
│                                                        │
│  You captured:                                         │
│  • Core concept (light → food) ✓                      │
│  • Oxygen production ✓                                 │
│                                                        │
│  You could add:                                        │
│  • Occurs in chloroplasts                              │
│  • Produces glucose specifically                       │
│                                                        │
│  Grade: B+                                             │
│                                                        │
│  [Continue]                                            │
└────────────────────────────────────────────────────────┘
```

### Grading Rubric

**A+ / A**: Complete, accurate, includes all key concepts
**B**: Covers main ideas, minor details missing
**C**: Partial understanding, significant gaps
**D**: Major misconceptions or very incomplete
**F**: Incorrect or no meaningful content

### Hint Node Display

**Single Hint (most common):**
- Recall node on left, hint node on right
- Both visible side-by-side
- Camera framed to show both

**Multiple Hints (when middle node retested):**
- Recall node in center
- Hint nodes on left and right
- All three visible simultaneously

**Example: Node B Full Recall (showing Nodes A & C):**
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ┌────────┐    ┌──────────────┐    ┌────────┐          │
│  │Node A: │    │ Recall B:    │    │Node C: │          │
│  │        │    │              │    │        │          │
│  │[hint]  │    │ [Question]   │    │[hint]  │          │
│  │        │    │              │    │        │          │
│  │[shown] │    │ [Input area] │    │[shown] │          │
│  └────────┘    └──────────────┘    └────────┘          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Recall Cycle Patterns

### Cycle 1 (after Nodes A, B, C)

| Recall # | Node | Type | Hint Nodes | Spacing |
|----------|------|------|------------|---------|
| 1 | B | Partial | None | 1 back |
| 2 | A | Full | B | 2 back |
| 3 | C | Full | B | Current |

**Why this pattern:**
- B gets partial recall (easiest, most recent)
- A gets full recall with B as context
- C gets full recall with B as context
- Middle node (B) serves as anchor for both neighbors

### Cycle 2 (after Nodes D, E, F)

| Recall # | Node | Type | Hint Nodes | Spacing |
|----------|------|------|------------|---------|
| 1 | B | Full | A, C | 3 back |
| 2 | E | Partial | None | 1 back |
| 3 | D | Full | E | 2 back |
| 4 | F | Full | E | Current |

**Why this pattern:**
- B gets retested (now 3 nodes back) with full context
- E gets partial recall (new middle node)
- D and F get full recall with E as anchor
- Tests long-term retention of B

### Cycle 3 (after Nodes G, H, I)

| Recall # | Node | Type | Hint Nodes | Spacing |
|----------|------|------|------------|---------|
| 1 | E | Full | D, F | 3 back |
| 2 | H | Partial | None | 1 back |
| 3 | G | Full | H | 2 back |
| 4 | I | Full | H | Current |

**Pattern continues** with same logic...

### Final Cycle (if lesson ends on nodes X, Y, Z)

| Recall # | Node | Type | Hint Nodes | Spacing |
|----------|------|------|------------|---------|
| 1 | Y | Partial | None | 1 back |
| 2 | X | Full | Y | 2 back |
| 3 | Z | Full | Y | Current |
| 4 | Y | Full | None | Comprehensive |

**Special case:** Middle node gets final comprehensive test with no hints.

---

## Data Storage

### Node Structure

```typescript
interface Node {
  id: string;
  position: number; // 0-indexed position in lesson
  title: string;
  mainText: string; // Contains vocab terms inline
  vocabulary: VocabTerm[];
  thinkingQuestion?: string;
  
  // Spatial position on whiteboard
  x: number;
  y: number;
  
  // AI-generated content
  aiSummary: string; // Same as mainText initially
  
  // User reconstructions from recalls
  recalls: RecallAttempt[];
}

interface VocabTerm {
  term: string;
  definition: string;
  // Position in mainText for highlighting
  startIndex: number;
  endIndex: number;
}

interface RecallAttempt {
  timestamp: Date;
  recallType: 'partial' | 'full';
  cycleNumber: number;
  
  // For partial recall
  vocabAnswers?: {
    term: string;
    userAnswer: string;
    correct: boolean;
  }[];
  
  // For full recall
  userSummary?: string;
  grade?: 'F' | 'D' | 'C' | 'B' | 'A' | 'A+';
  feedback?: {
    strengths: string[];
    missed: string[];
  };
  
  // Which nodes were shown as hints
  hintNodeIds: string[];
}
```

### Lesson Structure

```typescript
interface Lesson {
  id: string;
  subjectId: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Generated structure
  nodes: Node[];
  totalNodes: number; // 5-25 based on difficulty
  
  // Progress tracking
  currentNodeIndex: number;
  currentPhase: 'teaching' | 'recall' | 'complete';
  completedCycles: number;
  
  // Overall performance
  averageGrade?: number;
  weakNodes: string[]; // Node IDs with grades < C
  
  createdAt: Date;
  completedAt?: Date;
}
```

---

## Post-Lesson Review

### Review Dashboard

After lesson completion, user sees:

```
Lesson Complete: Photosynthesis
═══════════════════════════════

Overall Performance: B+ (87%)

Nodes Completed: 15/15

Recall Performance:
├─ Cycle 1: A- (3 nodes)
├─ Cycle 2: B+ (4 nodes)
├─ Cycle 3: A (4 nodes)
├─ Cycle 4: B (4 nodes)
└─ Cycle 5: A (4 nodes)

Vocabulary Mastery: 42/45 terms (93%)

─────────────────────────────────

Nodes Needing Review (Grade < B):

• Node 5: Calvin Cycle (C)
  → Missed: RuBisCO enzyme, carbon fixation
  [Retry] button

• Node 8: Electron Transport Chain (D)
  → Missed: Proton gradient, chemiosmosis
  [Retry] button

─────────────────────────────────

[View All Nodes] [Export Notes] [Back to Dashboard]
```

### Retry Feature

When user clicks **[Retry]** on a weak node:

1. **Camera pans** to that node on the whiteboard
2. **AI provides scaffolded hints** based on what was missed
3. **User attempts reconstruction** again
4. **New grade recorded** (tracks improvement)

**Example Retry Flow:**
```
Let's review Node 5: Calvin Cycle

Last time you wrote:
"The Calvin cycle uses ATP and NADPH to make sugar."

You got the basics! ✓

But you missed some key details. Let me help...

[Hint #1 appears]
Think about the enzyme that captures CO₂...

[User tries to recall]

[If still stuck, Hint #2]
It's called RuBisCO - the most abundant protein on Earth!

[User incorporates hint]

[AI grades new attempt]
Much better! You now mentioned carbon fixation and 
RuBisCO. 

New Grade: B+ (improved from C)
```

### Export Notes Feature

User can export their reconstructed summaries:

```markdown
# Photosynthesis - My Study Notes

## Node 1: Introduction to Photosynthesis
My summary: "Photosynthesis is the process where plants..."
AI summary: "Photosynthesis is the conversion of light energy..."
Grade: A

## Node 2: Light-Dependent Reactions
My summary: "Light reactions happen in thylakoids and produce ATP..."
AI summary: "The light-dependent reactions occur in the thylakoid..."
Grade: B+

[... all nodes ...]

## Vocabulary I Struggled With:
- NADPH (confused with NADH)
- RuBisCO (forgot the name)
- Chemiosmosis (missed this concept)
```

---

## Lesson Map Sidebar

### Toggle Button
- Located in navbar (top-right)
- Icon: Map/tree structure icon
- Label: "Lesson Map" or just icon

### When Opened

**Whiteboard zooms out** to show lesson structure drawn on the board:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         Photosynthesis Lesson                          │
│         ═══════════════════════                        │
│                                                         │
│    ┌──────┐      ┌──────┐      ┌──────┐              │
│    │  1   │──────│  2   │──────│  3   │              │
│    │  A   │      │  B+  │      │  A-  │              │
│    └──────┘      └──────┘      └──────┘              │
│                                                         │
│              [RECALL CYCLE 1] ✓                        │
│                                                         │
│    ┌──────┐      ┌──────┐      ┌──────┐              │
│    │  4   │──────│  5   │──────│  6   │              │
│    │ 📍   │      │ ... │      │ ... │              │
│    └──────┘      └──────┘      └──────┘              │
│     YOU                                                 │
│     ARE                                                 │
│     HERE                                                │
│                                                         │
│  ┌─────────────────────────────────────────┐           │
│  │ Vocabulary (15 nodes):                  │           │
│  │                                          │           │
│  │ Learned (8 terms):                      │           │
│  │ • Photosynthesis • Chlorophyll • ATP    │           │
│  │ • Thylakoid • Chloroplast • NADPH       │           │
│  │ • Glucose • Stroma                      │           │
│  │                                          │           │
│  │ Upcoming (37 terms):                    │           │
│  │ • RuBisCO • Carbon Fixation • G3P       │           │
│  │ • [... more terms ...]                  │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
│  [Click any node to jump there]                        │
│  [Close Map]                                            │
└─────────────────────────────────────────────────────────┘
```

### Features

**Node Display:**
- Completed nodes: Show grade badge
- Current node: Highlighted with "YOU ARE HERE"
- Upcoming nodes: Greyed out with "..."
- Recall cycles: Shown between node groups

**Vocabulary Section:**
- Learned terms: Full list visible
- Upcoming terms: Preview of what's coming
- Click term → See which nodes use it

**Interactions:**
- Click completed node → Preview your reconstruction
- Click upcoming node → See title only (no spoilers)
- Click vocab term → Highlight nodes containing it
- Close map → Return to current node

### Camera Behavior

- **View locks** to show full lesson structure
- **Cannot pan** outside the map view
- **Click node** → Zoom back in to that node
- **Close map** → Return to previous view

---

## Camera Control System

### During Teaching Phase
- **Auto-locked** to current node
- **May allow zoom** to see details (optional)
- **Cannot pan** to other nodes

### During Recall Phase
- **Locked** to recall node + hint nodes
- **No pan or zoom** allowed
- **View constrained** to prevent cheating

### During Lesson Map
- **Locked** to map view
- **Shows all nodes** in zoomed-out view
- **Click to navigate** to specific nodes

### Transitions
- **Smooth camera pans** between nodes
- **Zoom in/out** when entering/exiting map
- **Easing animations** for professional feel

---

## AI Persona & Communication Style

### Writing Style
- **Handwritten font** (Caveat, Permanent Marker, etc.)
- **Stroke-by-stroke animation** as if being written
- **Slight imperfections** (wobbly lines, natural variation)
- **Different colors** for emphasis (vocab in yellow, feedback in green/red)

### Tone
- **Encouraging**: "Great start!", "You're getting it!"
- **Specific**: Points out exactly what was good/missing
- **Constructive**: Focuses on what to add, not just what's wrong
- **Concise**: Brief feedback, not overwhelming

### Feedback Examples

**Excellent (A/A+):**
```
Excellent! ✓✓✓

You nailed all the key concepts:
• Core process ✓
• Location (chloroplasts) ✓
• Products (glucose, oxygen) ✓

Grade: A+
```

**Good (B):**
```
Good work! ✓

You got the main idea:
• Light → energy ✓
• Happens in plants ✓

To improve:
• Mention chloroplasts
• Include oxygen production

Grade: B
```

**Needs Work (C/D):**
```
You're on the right track...

What you got:
• Plants use sunlight ✓

What's missing:
• Where it happens
• What's produced
• Why it's important

Let's try again with hints!

Grade: C
```

---

## Spaced Repetition Science

### Why This Pattern Works

**Immediate Recall (1 node back):**
- Tests short-term retention
- Catches gaps before they solidify
- Builds confidence with recent material

**Medium Recall (2 nodes back):**
- Tests working memory
- Requires active reconstruction
- Strengthens neural pathways

**Long-term Recall (3 nodes back):**
- Tests long-term retention
- Identifies what truly stuck
- Reveals concepts needing more review

**Interleaving (middle node retest):**
- Prevents forgetting of earlier material
- Provides context from neighbors
- Reinforces connections between concepts

### Optimal Spacing
- **3 nodes** between recalls balances:
  - Not too soon (too easy)
  - Not too late (already forgotten)
  - Enough new content to maintain engagement
  - Frequent enough to catch gaps

---

## Future Enhancements

### Diagrams
- AI draws diagrams on the whiteboard
- During partial recall: Parts of diagram erase, user labels them
- During full recall: Diagram stays as hint

### Adaptive Difficulty
- If user consistently scores high: Increase node complexity
- If user struggles: Provide more hints, simpler questions
- Adjust recall timing based on performance

### Spaced Repetition Beyond Lesson
- Track when nodes should be reviewed again
- Send notifications: "Review Photosynthesis in 3 days"
- Build long-term retention schedule

### Collaborative Learning
- Share lesson structures with classmates
- Compare reconstructions (anonymized)
- See common misconceptions

### Analytics
- Track which concepts are hardest across all users
- Identify optimal node length/complexity
- Measure retention curves over time

---

## Technical Implementation Notes

### Whiteboard Rendering
- Use **Canvas or SVG** for drawing
- **Layered rendering**: Background → Content → Annotations → UI
- **Animation library** for stroke-by-stroke writing (anime.js, GSAP)

### Camera System
- **Transform matrix** for pan/zoom
- **Lock state** to disable user controls
- **Smooth transitions** between views (easing functions)

### Text Input
- **Inline editing** for partial recall blanks
- **Textarea** for full recall summaries
- **Auto-focus** next blank after submission

### AI Integration
- **DeepSeek API** for content generation
- **Streaming responses** for real-time writing effect
- **Grading prompts** that return structured feedback

### State Management
- Track current node, phase, cycle
- Store all recall attempts with timestamps
- Calculate grades and identify weak nodes
- Persist to database after each interaction

---

## Success Metrics

### For Users
- **Completion rate**: % of lessons finished
- **Average grade**: Overall performance
- **Retention rate**: Performance on long-term recalls
- **Improvement**: Grade changes on retries

### For System
- **Optimal node count**: Which lesson lengths work best
- **Effective spacing**: Is 3 nodes the right interval?
- **Grading accuracy**: Does AI grading match learning outcomes?
- **Engagement**: Do users complete recall cycles?

---

## Conclusion

Memory-driven lessons combine:
- ✅ **Spaced repetition** for long-term retention
- ✅ **Active recall** for deep learning
- ✅ **Immediate feedback** for correction
- ✅ **Interleaving** for connection-building
- ✅ **Adaptive review** for weak areas
- ✅ **Engaging interface** for motivation

The whiteboard paradigm makes learning feel **collaborative** and **spatial**, leveraging visual memory alongside conceptual understanding.

The result: **Students remember what they learn.**
