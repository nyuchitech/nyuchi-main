import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Button,
  IndexTable,
  useIndexResourceState,
  DataTable,
  ButtonGroup,
  Icon,
  Tabs,
  TextField,
  Select,
  Modal,
  Banner,
  Pagination,
  Filters,
  ChoiceList,
} from '@shopify/polaris';
import {
  PersonIcon,
  OrganizationIcon,
  CreditCardIcon,
  ChartVerticalIcon,
  EditIcon,
  DeleteIcon,
  ExportIcon,
  PlusIcon,
} from '@shopify/polaris-icons';
import { useState, useCallback, useMemo } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import { getAuthenticatedUser } from '~/lib/auth';

// Types for admin data
interface Customer {
  id: string;
  name: string;
  email: string;
  type: 'individual' | 'organization';
  subscription: string;
  status: 'active' | 'trial' | 'cancelled' | 'past_due';
  revenue: number;
  joined: string;
  lastActivity: string;
  location: string;
  employees?: number;
}

interface SubscriptionPlan {
  plan: string;
  count: number;
  revenue: number;
  description: string;
}

interface AdminData {
  overview: {
    totalCustomers: number;
    organizationCustomers: number;
    individualCustomers: number;
    totalRevenue: number;
    monthlyRecurring: number;
    activeSubscriptions: number;
    churnRate: number;
  };
  customers: Customer[];
  subscriptions: SubscriptionPlan[];
}

// Admin-only access control
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getAuthenticatedUser(request);
  
  // Check if user is admin (this would be stored in user profile or JWT claims)
  const isAdmin = user?.email?.endsWith('@nyuchi.com');
  
  if (!isAdmin) {
    throw new Response('Access Denied - Admin Only', { status: 403 });
  }

  // Simulate admin data - would come from D1 database
  const adminData = {
    overview: {
      totalCustomers: 1247,
      organizationCustomers: 89,
      individualCustomers: 1158,
      totalRevenue: 45200,
      monthlyRecurring: 12400,
      activeSubscriptions: 892,
      churnRate: 2.1,
    },
    customers: [
      {
        id: '1',
        name: 'Tendai Mukamuri',
        email: 'tendai@example.co.zw',
        type: 'individual',
        subscription: 'Pro Plan',
        status: 'active',
        revenue: 299,
        joined: '2025-01-15',
        lastActivity: '2025-09-27',
        location: 'Harare, Zimbabwe',
      },
      {
        id: '2',
        name: 'Ubuntu Solutions Ltd',
        email: 'admin@ubuntusolutions.co.za',
        type: 'organization',
        subscription: 'Enterprise',
        status: 'active',
        revenue: 2499,
        joined: '2024-11-20',
        lastActivity: '2025-09-28',
        location: 'Cape Town, South Africa',
        employees: 25,
      },
      {
        id: '3',
        name: 'Farai Chimbindi',
        email: 'farai@startup.zw',
        type: 'individual',
        subscription: 'Starter',
        status: 'trial',
        revenue: 0,
        joined: '2025-09-20',
        lastActivity: '2025-09-28',
        location: 'Bulawayo, Zimbabwe',
      },
    ],
    subscriptions: [
      { plan: 'Community', count: 355, revenue: 0, description: 'Always free - Ubuntu principle' },
      { plan: 'Starter', count: 287, revenue: 8610, description: 'Individual entrepreneurs' },
      { plan: 'Pro', count: 201, revenue: 20099, description: 'Growing businesses' },
      { plan: 'Enterprise', count: 49, revenue: 122549, description: 'Organizations' },
    ],
  };

  return { adminData, user };
}

export default function AdminDashboard() {
  const { adminData, user } = useLoaderData<typeof loader>();
  
  // Tab state
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Modal state
  const [modalActive, setModalActive] = useState(false);
  const [modalType, setModalType] = useState<'edit' | 'delete' | 'create'>('edit');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // Filter state
  const [customerType, setCustomerType] = useState<string[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string[]>([]);
  const [queryValue, setQueryValue] = useState('');
  
  // Table selection
  const resourceName = {
    singular: 'customer',
    plural: 'customers',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(adminData.customers);

  // Filter customers based on selection
  const filteredCustomers = useMemo(() => {
    return adminData.customers.filter((customer: any) => {
      const matchesQuery = 
        customer.name.toLowerCase().includes(queryValue.toLowerCase()) ||
        customer.email.toLowerCase().includes(queryValue.toLowerCase());
      
      const matchesType = customerType.length === 0 || customerType.includes(customer.type);
      const matchesStatus = subscriptionStatus.length === 0 || subscriptionStatus.includes(customer.status);
      
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [adminData.customers, queryValue, customerType, subscriptionStatus]);

  // Handlers
  const handleTabChange = useCallback((selectedTabIndex: number) => {
    setSelectedTab(selectedTabIndex);
  }, []);

  const handleModalToggle = useCallback(() => {
    setModalActive((active) => !active);
  }, []);

  const handleEditCustomer = useCallback((customer: any) => {
    setSelectedCustomer(customer);
    setModalType('edit');
    setModalActive(true);
  }, []);

  const handleDeleteCustomer = useCallback((customer: any) => {
    setSelectedCustomer(customer);
    setModalType('delete');
    setModalActive(true);
  }, []);

  const handleCreateCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setModalType('create');
    setModalActive(true);
  }, []);

  // Filter controls
  const handleCustomerTypeChange = useCallback(
    (value: string[]) => setCustomerType(value),
    []
  );

  const handleSubscriptionStatusChange = useCallback(
    (value: string[]) => setSubscriptionStatus(value),
    []
  );

  const handleQueryValueChange = useCallback(
    (value: string) => setQueryValue(value),
    []
  );

  const handleClearFilters = useCallback(() => {
    setCustomerType([]);
    setSubscriptionStatus([]);
    setQueryValue('');
  }, []);

  const filters = [
    {
      key: 'customerType',
      label: 'Customer Type',
      filter: (
        <ChoiceList
          title="Customer Type"
          titleHidden
          choices={[
            { label: 'Individual', value: 'individual' },
            { label: 'Organization', value: 'organization' },
          ]}
          selected={customerType}
          onChange={handleCustomerTypeChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'subscriptionStatus',
      label: 'Subscription Status',
      filter: (
        <ChoiceList
          title="Subscription Status"
          titleHidden
          choices={[
            { label: 'Active', value: 'active' },
            { label: 'Trial', value: 'trial' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Past Due', value: 'past_due' },
          ]}
          selected={subscriptionStatus}
          onChange={handleSubscriptionStatusChange}
          allowMultiple
        />
      ),
    },
  ];

  const appliedFilters = [
    ...customerType.map((type) => ({
      key: 'customerType',
      label: `Type: ${type}`,
      onRemove: () => setCustomerType(customerType.filter((t) => t !== type)),
    })),
    ...subscriptionStatus.map((status) => ({
      key: 'subscriptionStatus', 
      label: `Status: ${status}`,
      onRemove: () => setSubscriptionStatus(subscriptionStatus.filter((s) => s !== status)),
    })),
  ];

  // Overview metrics for admin
  const overviewMetrics = [
    {
      title: 'Total Customers',
      value: adminData.overview.totalCustomers.toLocaleString(),
      icon: PersonIcon,
      badge: '+47 this month',
      tone: 'success' as const,
    },
    {
      title: 'Organizations',
      value: adminData.overview.organizationCustomers.toLocaleString(),
      icon: OrganizationIcon,
      badge: '+12 this month',
      tone: 'info' as const,
    },
    {
      title: 'Monthly Revenue',
      value: `$${adminData.overview.monthlyRecurring.toLocaleString()}`,
      icon: CreditCardIcon,
      badge: '+18.2%',
      tone: 'success' as const,
    },
    {
      title: 'Active Subscriptions',
      value: adminData.overview.activeSubscriptions.toLocaleString(),
      icon: ChartVerticalIcon,
      badge: `${adminData.overview.churnRate}% churn`,
      tone: 'warning' as const,
    },
  ];

  // Customer table rows
  const customerRows = filteredCustomers.map((customer: any) => [
    customer.name,
    customer.email,
    <Badge key={customer.id} tone={customer.type === 'organization' ? 'info' : 'success'}>
      {customer.type}
    </Badge>,
    customer.subscription,
    <Badge 
      key={customer.id} 
      tone={
        customer.status === 'active' ? 'success' : 
        customer.status === 'trial' ? 'info' : 
        'critical'
      }
    >
      {customer.status}
    </Badge>,
    `$${customer.revenue}`,
    customer.location,
    <ButtonGroup key={customer.id} variant="segmented">
      <Button
        size="micro"
        icon={EditIcon}
        accessibilityLabel={`Edit ${customer.name}`}
        onClick={() => handleEditCustomer(customer)}
      />
      <Button
        size="micro"
        icon={DeleteIcon}
        tone="critical"
        accessibilityLabel={`Delete ${customer.name}`}
        onClick={() => handleDeleteCustomer(customer)}
      />
    </ButtonGroup>,
  ]);

  const tabs = [
    {
      id: 'overview',
      content: 'Overview',
    },
    {
      id: 'customers',
      content: 'Customers',
    },
    {
      id: 'subscriptions',
      content: 'Subscriptions',
    },
    {
      id: 'analytics',
      content: 'Analytics',
    },
  ];

  return (
    <Page
      title="🇿🇼 Ubuntu Platform Admin"
      subtitle={`Welcome back, ${user?.email || 'Admin'}`}
      primaryAction={{
        content: 'Export Data',
        icon: ExportIcon,
      }}
      secondaryActions={[
        {
          content: 'Add Customer',
          icon: PlusIcon,
          onAction: handleCreateCustomer,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Banner tone="info" title="Ubuntu Administration">
            <Text as="p">
              "I am because we are" - Your administrative actions serve the entire African entrepreneurship ecosystem.
              Always prioritize community benefit alongside business metrics.
            </Text>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
            {/* Overview Tab */}
            {selectedTab === 0 && (
              <Layout>
                <Layout.Section>
                  {/* Admin Metrics */}
                  <InlineStack gap="400" wrap={false}>
                    {overviewMetrics.map((metric) => (
                      <Card key={metric.title}>
                        <BlockStack gap="200">
                          <InlineStack align="space-between">
                            <Text variant="headingMd" as="h3">{metric.title}</Text>
                            <Icon source={metric.icon} tone="base" />
                          </InlineStack>
                          <Text variant="headingLg" as="span">{metric.value}</Text>
                          <Badge tone={metric.tone}>{metric.badge}</Badge>
                        </BlockStack>
                      </Card>
                    ))}
                  </InlineStack>
                </Layout.Section>

                <Layout.Section>
                  <Card>
                    <BlockStack gap="400">
                      <Text variant="headingMd" as="h2">Subscription Distribution</Text>
                      <DataTable
                        columnContentTypes={['text', 'numeric', 'numeric', 'text']}
                        headings={['Plan', 'Customers', 'Revenue', 'Ubuntu Philosophy']}
                        rows={adminData.subscriptions.map((sub: any) => [
                          sub.plan,
                          sub.count,
                          sub.plan === 'Community' ? 'Free Forever' : `$${sub.revenue.toLocaleString()}`,
                          sub.description,
                        ])}
                        totals={['Total', adminData.subscriptions.reduce((sum: any, sub: any) => sum + sub.count, 0), '', '']}
                      />
                    </BlockStack>
                  </Card>
                </Layout.Section>
              </Layout>
            )}

            {/* Customers Tab */}
            {selectedTab === 1 && (
              <Layout>
                <Layout.Section>
                  <Card>
                    <BlockStack gap="400">
                      <Text variant="headingMd" as="h2">Customer Management</Text>
                      
                      <Filters
                        queryValue={queryValue}
                        filters={filters}
                        appliedFilters={appliedFilters}
                        onQueryChange={handleQueryValueChange}
                        onQueryClear={handleClearFilters}
                        onClearAll={handleClearFilters}
                      />

                      <IndexTable
                        resourceName={resourceName}
                        itemCount={filteredCustomers.length}
                        selectedItemsCount={
                          allResourcesSelected ? 'All' : selectedResources.length
                        }
                        onSelectionChange={handleSelectionChange}
                        headings={[
                          { title: 'Customer Name' },
                          { title: 'Email' },
                          { title: 'Type' },
                          { title: 'Subscription' },
                          { title: 'Status' },
                          { title: 'Revenue' },
                          { title: 'Location' },
                          { title: 'Actions' },
                        ]}
                        bulkActions={[
                          {
                            content: 'Export selected',
                            onAction: () => console.log('Export customers'),
                          },
                          {
                            content: 'Send Ubuntu newsletter',
                            onAction: () => console.log('Send newsletter'),
                          },
                        ]}
                      >
                        {customerRows.map((row: any, index: number) => (
                          <IndexTable.Row
                            id={filteredCustomers[index].id}
                            key={filteredCustomers[index].id}
                            selected={selectedResources.includes(filteredCustomers[index].id)}
                            position={index}
                          >
                            {row.map((cell: any, cellIndex: number) => (
                              <IndexTable.Cell key={cellIndex}>{cell}</IndexTable.Cell>
                            ))}
                          </IndexTable.Row>
                        ))}
                      </IndexTable>
                    </BlockStack>
                  </Card>
                </Layout.Section>
              </Layout>
            )}

            {/* Subscriptions Tab */}
            {selectedTab === 2 && (
              <Layout>
                <Layout.Section>
                  <Card>
                    <BlockStack gap="400">
                      <Text variant="headingMd" as="h2">Subscription Analytics</Text>
                      <Text variant="bodyMd" as="p">
                        Track subscription health across the Ubuntu Platform ecosystem.
                      </Text>
                      
                      <DataTable
                        columnContentTypes={['text', 'numeric', 'numeric', 'numeric', 'text']}
                        headings={['Plan', 'Active', 'Trial', 'Monthly Revenue', 'Ubuntu Impact']}
                        rows={[
                          ['Community Plan', '355', '0', 'Free Forever', 'Foundation of Ubuntu philosophy'],
                          ['Starter Plan', '201', '86', '$8,610', 'Individual empowerment'],
                          ['Pro Plan', '156', '45', '$20,099', 'Business growth'],
                          ['Enterprise Plan', '35', '14', '$122,549', 'Community ecosystem building'],
                        ]}
                        totals={['Total', '747', '145', '$151,258', 'Collective prosperity']}
                      />

                      <Text variant="bodySm" as="p" tone="subdued">
                        The Community Plan remains free forever as part of our Ubuntu commitment: "I am because we are"
                      </Text>
                    </BlockStack>
                  </Card>
                </Layout.Section>
              </Layout>
            )}

            {/* Analytics Tab */}
            {selectedTab === 3 && (
              <Layout>
                <Layout.Section>
                  <InlineStack gap="400" wrap>
                    <Card>
                      <BlockStack gap="300">
                        <Text variant="headingMd" as="h3">Growth Metrics</Text>
                        <Text variant="bodyMd" as="p">Customer acquisition: +47 this month</Text>
                        <Text variant="bodyMd" as="p">Revenue growth: +18.2%</Text>
                        <Text variant="bodyMd" as="p">Ubuntu engagement: 96%</Text>
                      </BlockStack>
                    </Card>
                    
                    <Card>
                      <BlockStack gap="300">
                        <Text variant="headingMd" as="h3">Community Impact</Text>
                        <Text variant="bodyMd" as="p">Success stories shared: 342</Text>
                        <Text variant="bodyMd" as="p">Cross-collaboration projects: 89</Text>
                        <Text variant="bodyMd" as="p">Knowledge transfers: 1,247</Text>
                      </BlockStack>
                    </Card>
                  </InlineStack>
                </Layout.Section>
              </Layout>
            )}
          </Tabs>
        </Layout.Section>
      </Layout>

      {/* Customer Modal */}
      <Modal
        open={modalActive}
        onClose={handleModalToggle}
        title={
          modalType === 'create' ? 'Add New Customer' :
          modalType === 'edit' ? `Edit ${selectedCustomer?.name}` :
          `Delete ${selectedCustomer?.name}`
        }
        primaryAction={{
          content: modalType === 'delete' ? 'Delete' : 'Save',
          destructive: modalType === 'delete',
          onAction: handleModalToggle,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleModalToggle,
          },
        ]}
      >
        <Modal.Section>
          {modalType === 'delete' ? (
            <Text as="p">
              Are you sure you want to delete {selectedCustomer?.name}? This action cannot be undone.
              Remember our Ubuntu principle: every member strengthens our community.
            </Text>
          ) : (
            <BlockStack gap="400">
              <TextField
                label="Customer Name"
                value={selectedCustomer?.name || ''}
                onChange={() => {}}
                autoComplete="name"
              />
              <TextField
                label="Email"
                value={selectedCustomer?.email || ''}
                onChange={() => {}}
                autoComplete="email"
              />
              <Select
                label="Customer Type"
                options={[
                  { label: 'Individual', value: 'individual' },
                  { label: 'Organization', value: 'organization' },
                ]}
                value={selectedCustomer?.type || 'individual'}
                onChange={() => {}}
              />
              <Text variant="bodySm" as="p" tone="subdued">
                Ubuntu philosophy: Treat every customer as part of our extended family
              </Text>
            </BlockStack>
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}