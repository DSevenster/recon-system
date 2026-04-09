# Users and jobs to be done
Primary user: Payout administrator. Processes ~80 deals per day. Their job is to get clean deals through to payment and resolve problems in flagged deals as fast as possible. An easy process to automate with the current business logic.

Secondary user: Accounts team. Performs a second-line check after payout sign-off, focusing on bank details and invoice figures.

The core job to be done: "When I open a deal, I want to know immediately whether it's clean or broken — and if it's broken, exactly what's wrong, where the conflict is, and what I need to do next."

# What I built
A single-deal reconciliation view, with a second clean deal to demonstrate the auto-approval path. The prototype includes:

- A summary bar showing critical flags, warnings, and auto-passed checks at a glance.
- A flags panel listing only the checks that need attention — blockers first, warnings second — with the conflicting values and source documents visible without clicking.
- A passing checks section, collapsed by default, that confirms the system verified everything else automatically.
- A PAS draft modal that pre-fills the broker query message when a flag is actioned, connecting the reconciliation output to the existing communication workflow.
- A deal switcher showing a clean deal alongside the flagged one — demonstrating what the 95% case looks like and making the automation value concrete.


# What I deliberately left out
- Pipeline view. A list of 80 deals would demonstrate scale but adds UI complexity without proving the core value. 
- Document viewer. Rendering the source PDFs inline would be useful in production but distracts from the reconciliation logic in a prototype. The source labels on each flag card communicate provenance without the overhead.
- Accounts team view. The second-line check is a real workflow but a different user with a different set of checks. Building both would halve the depth of each.
- PAS response flow. Receiving and processing broker responses is the other half of the communication loop. The prototype shows the outbound side only — enough to prove the concept.
- Real integrations and external calls. Its not relevant to illustrate the value of the prototype. 

## If I had more time
- Deal queue with visible triage logic — surfacing the highest-risk deals first based on flag severity and deal value making it clear from a glance what state they're in.
- Accounts team view with their specific check subset and a hand-off state between teams.
- PAS response handling — broker replies updating deal state and triggering re-check of affected fields only (not a full re-check from scratch).
- Confidence scoring on fuzzy matches — showing the algorithm's certainty and letting the user override with a reason.
- Audit trail — every human decision logged with timestamp and user, feeding into the automation roadmap.
