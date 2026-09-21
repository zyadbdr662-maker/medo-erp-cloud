import React from 'react';
import { PrivacyPolicyDocument } from '../../components/PrivacyPolicyDocument';
import { TermsOfServiceDocument } from '../../components/TermsOfServiceDocument';
import { DisclaimerDocument } from '../../components/DisclaimerDocument';

export const PrivacyPage = () => (
  <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-5xl mx-auto">
      <PrivacyPolicyDocument />
    </div>
  </div>
);

export const TermsPage = () => (
  <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-5xl mx-auto">
      <TermsOfServiceDocument />
    </div>
  </div>
);

export const DisclaimerPage = () => (
  <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-5xl mx-auto">
      <DisclaimerDocument />
    </div>
  </div>
);
