import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PRODUCTION ENG #11", title: "Networking fundamentals", body: `VPC, subnets, NAT, security groups, VPN vs Direct Connect, DNS resolution.`, usecase: "Cloud network design." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["VPC and subnets", "NAT and security groups", "VPN and DNS"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Public vs private subnet? What is NAT gateway for? Security groups vs NACLs?", answer_keywords: ["VPC", "subnet", "NAT", "security group", "NACL"], seed_code: `// Public: IGW; private: NAT for outbound only
// NAT gateway: private subnet -> internet
// SG: stateful, instance-level; NACL: stateless, subnet`, feedback_correct: "✅ Public=IGW; private+NAT; SG stateful instance; NACL stateless subnet.", feedback_wrong: "Subnets; NAT; security groups vs NACLs.", expected: "Networking" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PE-11", title: "Networking fundamentals", shortName: "PE — NETWORK" });
