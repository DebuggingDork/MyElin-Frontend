"use client";

import { Masthead } from "@/components/layout/PageChrome";
import { Container } from "@/components/ui/Kit";

export function Privacy() {
  return (
    <section className="relative flex flex-col pt-[68px]">
      <div className="grid-lines absolute inset-0" />
      <Masthead section="Privacy & Data" />

      {/* ── HEADER ─────────────────────────────────────────── */}
      <Container wide className="relative z-10 pt-[clamp(3rem,8vh,5rem)] pb-16 border-b border-line">
        <h1 className="ledger-display rise max-w-3xl text-[clamp(2.4rem,5.4vw,4.2rem)] text-ink mb-6">
          Your data. <br className="hidden sm:block" />
          Your decisions. <span className="italic text-teal">Your control.</span>
        </h1>
        <p className="max-w-xl text-[16.5px] leading-[1.72] text-dim">
          Myelin collects only the information needed to provide simulations, manage accounts, evaluate simulation performance, and provide learning insights.
        </p>
      </Container>                   

      <Container className="relative z-10 py-16 lg:py-20 lg:max-w-3xl ml-0 lg:mx-auto">
        
        {/* 1. What data do we collect? */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-line">1. What data do we collect?</h2>
          
          <div className="mb-8">
            <h3 className="tick-label text-teal mb-4 uppercase">Account Information</h3>
            <ul className="space-y-2 text-dim text-sm">
              <li>• Name</li>
              <li>• Email address</li>
              <li>• College / organization</li>
              <li>• Program / course information</li>
              <li>• Account credentials</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="tick-label text-teal mb-4 uppercase">Simulation Data</h3>
            <ul className="space-y-2 text-dim text-sm">
              <li>• Decisions made during simulations</li>
              <li>• Responses and written reflections</li>
              <li>• Simulation scores</li>
              <li>• Simulation progress</li>
              <li>• Time and completion information</li>
              <li>• Decision history</li>
              <li>• Performance across simulations</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="tick-label text-teal mb-4 uppercase">Institutional Data</h3>
            <p className="text-sm text-dim mb-4 italic">Where Myelin is provided through a college or organization:</p>
            <ul className="space-y-2 text-dim text-sm">
              <li>• Cohort / class information</li>
              <li>• Enrollment information</li>
              <li>• Faculty or administrator assignments</li>
              <li>• Institutional reporting data</li>
            </ul>
          </div>

          <div>
            <h3 className="tick-label text-teal mb-4 uppercase">Technical Data</h3>
            <ul className="space-y-2 text-dim text-sm">
              <li>• Device and browser information</li>
              <li>• IP address</li>
              <li>• Login and session information</li>
              <li>• Basic usage and diagnostic information</li>
            </ul>
          </div>
        </div>

        {/* 2. Why do we collect it? */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-line">2. Why do we collect it?</h2>
          <h3 className="tick-label text-teal mb-4 uppercase">We use data to:</h3>
          <ul className="space-y-2 text-dim text-sm">
            <li>• Create and manage learner accounts</li>
            <li>• Run simulations</li>
            <li>• Calculate simulation outcomes</li>
            <li>• Generate Decision Intelligence Reports</li>
            <li>• Track learning progress</li>
            <li>• Provide instructors with authorized cohort insights</li>
            <li>• Improve simulation performance and reliability</li>
            <li>• Maintain platform security</li>
          </ul>
        </div>

        {/* 3. Who can see my data? */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-line">3. Who can see my data?</h2>
          
          <div className="mb-6">
            <h4 className="text-[15px] font-medium text-ink mb-2">Students</h4>
            <p className="text-sm text-dim">Students can access their own personal information, simulation history, and reports.</p>
          </div>
          <div className="mb-6">
            <h4 className="text-[15px] font-medium text-ink mb-2">Faculty / Instructors</h4>
            <p className="text-sm text-dim">Faculty can access learner information and performance only for cohorts they are authorized to manage.</p>
          </div>
          <div className="mb-6">
            <h4 className="text-[15px] font-medium text-ink mb-2">Institution Administrators</h4>
            <p className="text-sm text-dim">Authorized institutional administrators may access appropriate cohort-level information based on the institution's agreement with Myelin.</p>
          </div>
          <div className="mb-6">
            <h4 className="text-[15px] font-medium text-ink mb-2">Myelin</h4>
            <p className="text-sm text-dim">Authorized Myelin personnel may access data where required to operate, secure, support, or improve the service.</p>
          </div>
          <p className="text-sm italic text-teal mt-4">Personal student data is not publicly displayed.</p>
        </div>

        {/* 4. Who owns the learner data? */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-line">4. Who owns the learner data?</h2>
          <p className="text-sm text-dim leading-relaxed">
            The institution and/or learner retains ownership of their data, subject to the terms of the applicable agreement. Myelin processes that data only for defined service purposes.
          </p>
        </div>

        {/* 5. How are Decision Intelligence Reports shared? */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-line">5. How are Decision Intelligence Reports shared?</h2>
          <p className="text-sm text-ink font-medium mb-4">Reports are private by default.</p>
          <p className="text-sm text-dim mb-3">A student's report is shared only with:</p>
          <ul className="space-y-2 text-dim text-sm mb-4">
            <li>• the student,</li>
            <li>• authorized faculty/instructors,</li>
            <li>• authorized institutional administrators,</li>
          </ul>
          <p className="text-sm text-dim">according to the applicable plan and institution agreement.</p>
        </div>

        {/* 6. How long do we keep data? */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-line">6. How long do we keep data?</h2>
          <p className="text-sm text-dim leading-relaxed">
            We retain learner data only for as long as necessary to provide the service, meet contractual requirements, maintain academic records where applicable, resolve disputes, and comply with legal obligations.
          </p>
        </div>

        {/* 7. Can I request deletion? */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-line">7. Can I request deletion?</h2>
          <p className="text-sm text-dim leading-relaxed mb-4">
            Yes. Learners may request access, correction, or deletion of their personal information, subject to applicable legal, contractual, and institutional requirements.
          </p>
          <p className="text-sm text-dim">
            Privacy contact: <a href="mailto:privacy@myelinsimulations.com" className="text-teal hover:underline">privacy@myelinsimulations.com</a>
          </p>
        </div>

        {/* 8. Is student data used to train AI? */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-line">8. Is student data used to train AI?</h2>
          <p className="text-[17px] font-medium text-ink bg-teal/5 border-l-2 border-teal p-4">
            We do not use individual learner data to train public AI models.
          </p>
        </div>

        {/* 9. Is data shared with third parties? */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-line">9. Is data shared with third parties?</h2>
          <p className="text-sm text-dim mb-4">
            We share specific data with third-party service providers acting on our behalf for:
          </p>
          <ul className="space-y-2 text-dim text-sm">
            <li>• Cloud hosting</li>
            <li>• Authentication</li>
            <li>• Analytics</li>
            <li>• Email delivery</li>
            <li>• Payment processing</li>
            <li>• AI / model providers (No learner data is used to train public models)</li>
          </ul>
        </div>

        {/* 10. Security */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-line">10. Security</h2>
          <p className="text-sm text-dim leading-relaxed mb-6">
            Myelin uses reasonable technical and organizational safeguards designed to protect learner and institutional data against unauthorized access, loss, misuse, or disclosure. Core controls include:
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 text-dim text-sm">
            <li className="flex items-center gap-2"><span className="text-teal">•</span> encryption in transit</li>
            <li className="flex items-center gap-2"><span className="text-teal">•</span> encryption at rest</li>
            <li className="flex items-center gap-2"><span className="text-teal">•</span> access controls</li>
            <li className="flex items-center gap-2"><span className="text-teal">•</span> authentication</li>
            <li className="flex items-center gap-2"><span className="text-teal">•</span> audit logging</li>
            <li className="flex items-center gap-2"><span className="text-teal">•</span> backups</li>
            <li className="flex items-center gap-2"><span className="text-teal">•</span> incident response</li>
          </ul>
        </div>

        {/* 11. Cookies & Analytics */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-line">11. Cookies & Analytics</h2>
          <p className="text-sm text-dim leading-relaxed">
            We use cookies and essential tracking technologies to provide service functionality (such as keeping you logged in), monitor platform health, and gather aggregated usage statistics to improve the product. We do not use third-party advertising cookies. Users can control non-essential cookies through their browser settings.
          </p>
        </div>

        {/* 12. Children's Data */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-line">12. Children&apos;s Data</h2>
          <p className="text-sm text-dim leading-relaxed">
            Myelin is intended for higher education, universities, and professional learning. Our services are not directed at, nor do we knowingly collect personal information from, individuals under the age of 16 without parental or institutional consent.
          </p>
        </div>

        {/* 13. International / Institutional Compliance */}
        <div className="mb-20">
          <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-line">13. International / Institutional Compliance</h2>
          <p className="text-sm text-dim leading-relaxed mb-4">
            Myelin is designed to support institutional privacy and data-governance requirements. Specific obligations and responsibilities depend on the deployment, jurisdiction, and agreement with the institution.
          </p>
          <p className="text-sm text-dim leading-relaxed">
            Where applicable, we conform to the compliance frameworks legally required by our agreements with partner networks.
          </p>
        </div>

        {/* Footer Contact */}
        <div className="border border-teal/20 bg-teal/5 p-8 text-center rounded-sm shadow-[0_0_15px_rgba(20,184,166,0.05)]">
          <h3 className="font-serif text-xl text-ink mb-3">Questions about your data?</h3>
          <p className="text-sm text-dim mb-4">
            For privacy, data access, deletion, or institutional data-governance questions, contact:
          </p>
          <a href="mailto:privacy@myelinsimulations.com" className="text-lg font-mono text-teal hover:underline tracking-wide">
            privacy@myelinsimulations.com
          </a>
        </div>

      </Container>
    </section>
  );
}
