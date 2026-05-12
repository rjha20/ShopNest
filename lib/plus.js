const DEFAULT_PLUS_PLAN_SLUGS = [
    'plus',
    'plus_annual',
    'shopnest_plus',
    'shopnest-plus',
];

const configuredPlusPlanSlugs = (
    process.env.NEXT_PUBLIC_CLERK_PLUS_PLAN_SLUGS ||
    process.env.NEXT_PUBLIC_PLUS_PLAN_SLUGS ||
    ''
)
    .split(',')
    .map(slug => slug.trim())
    .filter(Boolean);

export const PLUS_PLAN_SLUGS = configuredPlusPlanSlugs.length > 0
    ? configuredPlusPlanSlugs
    : DEFAULT_PLUS_PLAN_SLUGS;

const normalizePlanValue = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^(u|user|o|org|organization):/, '');

export const valuesMatchPlusPlan = (values) => {
    const normalizedPlusPlans = PLUS_PLAN_SLUGS.map(normalizePlanValue);

    return values
        .flatMap(value => Array.isArray(value) ? value : [value])
        .filter(Boolean)
        .some(value => {
            const normalizedValue = normalizePlanValue(value);
            return normalizedPlusPlans.includes(normalizedValue);
        });
};

export const claimHasPlusPlan = (plansClaim) => {
    if (typeof plansClaim !== 'string') {
        return false;
    }

    return valuesMatchPlusPlan(plansClaim.split(',').map(plan => plan.trim()));
};

export const isPlusSubscriber = ({ has, user, sessionClaims } = {}) => {
    if (typeof has === 'function') {
        const hasPlusPlan = PLUS_PLAN_SLUGS.some(slug => {
            try {
                return has({ plan: slug }) || has({ plan: `u:${normalizePlanValue(slug)}` });
            } catch {
                return false;
            }
        });

        if (hasPlusPlan) {
            return true;
        }
    }

    if (claimHasPlusPlan(sessionClaims?.pla)) {
        return true;
    }

    const metadata = user?.publicMetadata || {};

    return valuesMatchPlusPlan([
        metadata.plan,
        metadata.planSlug,
        metadata.subscriptionPlan,
        metadata.subscription_plan,
        metadata.membership,
    ]);
};
