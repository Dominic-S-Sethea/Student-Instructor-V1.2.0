import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, ExternalLink, Mail, CheckCircle2, Globe } from 'lucide-react';
import { ClientPartnerOrg } from '../../types';
import { communityClient } from '../../services/communityClient';

export const OrganizationCommunityView: React.FC = () => {
  const [organizations, setOrganizations] = useState<ClientPartnerOrg[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrgs();
  }, [selectedType]);

  const loadOrgs = async () => {
    try {
      setLoading(true);
      const data = await communityClient.getOrganizations(selectedType !== 'ALL' ? selectedType : undefined);
      setOrganizations(data);
    } catch (err) {
      console.error('Failed to load partner orgs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-lg">Official Partner Universities & Organizations</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            CDES coordinates with Cambodia's leading higher-education institutes, MoEYS, and tech foundations to provide authenticated learning pathways.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'university', 'government_body', 'ngo', 'industry_partner'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                selectedType === t
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t === 'ALL' ? 'All Partners' : t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {organizations.map((org) => {
          const domains = typeof org.focus_domains === 'string'
            ? JSON.parse(org.focus_domains)
            : org.focus_domains;

          return (
            <div
              key={org.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <img
                    src={org.logo_url || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=200'}
                    alt={org.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Official Partner
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base mt-4">{org.name}</h4>
                {org.name_km && (
                  <p className="text-xs text-slate-500 font-medium">{org.name_km}</p>
                )}

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {org.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {domains.map((dom: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {dom}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={`mailto:${org.contact_email}`}
                  className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium transition"
                >
                  <Mail className="w-3.5 h-3.5" /> Contact Desk
                </a>

                {org.website_url && (
                  <a
                    href={org.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
