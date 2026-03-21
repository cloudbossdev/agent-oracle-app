# New Project Startup Checklist

## Purpose

Use this checklist when you have a new project idea and want to turn it into a
structured, executable project instead of jumping straight into ad hoc coding.

This is a general-purpose guide, not a project-specific roadmap.

## Phase 1: Capture The Idea

Before creating tasks or writing code, answer:

- What is the idea?
- What problem does it solve?
- Who is it for?
- Why is it worth building now?

Output:

- a short problem statement
- a short product goal

## Phase 2: Define The Product Clearly

Clarify the product before implementation begins.

Answer:

- What is the core outcome?
- What does the MVP need to do?
- What is explicitly out of scope?
- What assumptions are being made?
- What are the biggest unknowns or risks?

Output:

- MVP definition
- non-goals list
- assumptions list

## Phase 3: Set Up The Repo

Create a clean project home before real implementation work begins.

Suggested setup:

- create the repository
- add a basic README
- choose the default stable branch (`main`)
- add `.gitignore`
- add initial package/tooling setup only if needed
- decide the branch naming approach

If the project is still early, it is fine to stop after minimal setup and use
the repo primarily to store planning docs until execution is clear.

Output:

- repo exists
- stable baseline branch exists
- project has a place to store planning and decisions

## Phase 4: Create The Planning Layer

Do this before significant coding.

Create:

- roadmap
- milestone plan
- first milestone task list

The roadmap should answer:

- where the project is going
- what major milestones exist
- what order they should happen in

The milestone plan should answer:

- what this milestone is trying to achieve
- what deliverables are required
- what order tasks should happen in

The task list should answer:

- what the next concrete pieces of work are
- how you will know each one is done

Output:

- project roadmap
- milestone plan
- first actionable task list

## Phase 5: Define The Operating Workflow

Before real execution, decide how work will move through the repo.

Recommended default:

- `main` is stable
- one task per branch
- one pull request per task
- merge only after review and validation

Decide:

- branch naming conventions
- commit expectations
- PR expectations
- validation expectations
- how `main` stays safe

Output:

- workflow guide
- agreed branch and PR discipline

## Phase 6: Add Validation Early

Add enough automation to protect the repo before feature work grows.

At minimum, decide:

- how the project is built
- how the project is tested
- what should run automatically on pull requests

For many projects, this means:

- CI for build/test
- a documented local verification command

Output:

- initial CI
- local validation instructions

## Phase 7: Start The First Task Correctly

Only after the earlier phases are clear should implementation begin.

For the first task:

1. start from updated `main`
2. create a branch
3. make the change
4. run local validation
5. stage only intended files
6. commit clearly
7. push the branch
8. open the PR
9. review checks
10. merge if green and understood

Output:

- first real implementation PR

## Phase 8: Keep Decisions Durable

Do not leave important project thinking only in your head or in chat.

Document:

- roadmap changes
- milestone plans
- important architecture decisions
- provider/stack direction decisions
- release or rollback process once relevant

Output:

- durable project memory
- less repeated confusion

## Questions To Ask Before Writing Code

Use these as a quick gate:

- Do I understand the problem clearly?
- Do I know what the MVP is?
- Do I know what is out of scope?
- Do I know the next milestone?
- Do I know the next task?
- Do I know how I will validate the task?

If the answer to several of these is "no", more planning is probably needed.

## Practical Minimum Startup Sequence

For most non-trivial projects, this is a strong minimum:

1. write the product goal
2. define the MVP
3. list non-goals
4. create the repo
5. add roadmap doc
6. define milestones
7. break the first milestone into tasks
8. define branch/PR workflow
9. add CI
10. start the first implementation branch

## Common Failure Modes

Watch for these:

- starting to code before the MVP is clear
- mixing multiple concerns in one branch
- treating `main` as a scratch branch
- relying on memory instead of documentation
- creating too many future tasks in detail too early
- avoiding small decision docs for important technical choices

## Rule Of Thumb

Do not try to fully plan the entire life of the project up front.

Instead:

- plan the whole project at milestone level
- plan the next milestone in moderate detail
- plan the current task in high detail

That gives enough structure without overplanning.

