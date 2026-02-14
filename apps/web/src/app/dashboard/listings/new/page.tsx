'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { ImageUpload } from '@/components/listings/image-upload';
import { FUEL_TYPES, TRANSMISSION_TYPES, EMISSION_CLASSES, VEHICLE_CATEGORIES } from '@menon/shared';

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'EUR',
    condition: 'USED',
    categoryId: '',
    brand: '',
    model: '',
    year: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    power: '',
    emissionClass: '',
    axles: '',
    weight: '',
    color: '',
    vin: '',
    city: '',
    country: '',
    postalCode: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: API call to create listing + upload images
      console.log('Creating listing:', formData, images);
      router.push('/dashboard/listings');
    } catch (error) {
      console.error('Error creating listing:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen">
      <div className="container-main py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
          <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/dashboard/listings" className="hover:text-primary">Listings</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-text-primary font-medium">New Listing</span>
        </nav>

        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/listings">
            <button className="p-2 rounded-lg hover:bg-white border border-border">
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Create New Listing</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-5">Basic Information</h2>
            <div className="space-y-4">
              <Input
                label="Title *"
                id="title"
                placeholder="e.g., 2020 Volvo FH 500 Tractor Unit"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Price *"
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  required
                />
                <Select
                  label="Currency"
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  options={[
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'GBP', label: 'GBP (£)' },
                  ]}
                />
                <Select
                  label="Condition *"
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => updateField('condition', e.target.value)}
                  options={[
                    { value: 'USED', label: 'Used' },
                    { value: 'NEW', label: 'New' },
                  ]}
                />
              </div>
              <Select
                label="Category *"
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => updateField('categoryId', e.target.value)}
                options={[
                  { value: '', label: 'Select Category' },
                  ...VEHICLE_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
                ]}
              />
              <Textarea
                label="Description"
                id="description"
                placeholder="Describe the vehicle, its condition, features, equipment..."
                rows={5}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-5">Vehicle Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Brand" id="brand" placeholder="e.g., Volvo" value={formData.brand} onChange={(e) => updateField('brand', e.target.value)} />
              <Input label="Model" id="model" placeholder="e.g., FH 500" value={formData.model} onChange={(e) => updateField('model', e.target.value)} />
              <Input label="Year" id="year" type="number" placeholder="e.g., 2020" value={formData.year} onChange={(e) => updateField('year', e.target.value)} />
              <Input label="Mileage (km)" id="mileage" type="number" placeholder="e.g., 350000" value={formData.mileage} onChange={(e) => updateField('mileage', e.target.value)} />
              <Select
                label="Fuel Type"
                id="fuelType"
                value={formData.fuelType}
                onChange={(e) => updateField('fuelType', e.target.value)}
                options={[{ value: '', label: 'Select' }, ...FUEL_TYPES.map((f) => ({ value: f, label: f }))]}
              />
              <Select
                label="Transmission"
                id="transmission"
                value={formData.transmission}
                onChange={(e) => updateField('transmission', e.target.value)}
                options={[{ value: '', label: 'Select' }, ...TRANSMISSION_TYPES.map((t) => ({ value: t, label: t }))]}
              />
              <Input label="Power (HP)" id="power" placeholder="e.g., 500 HP" value={formData.power} onChange={(e) => updateField('power', e.target.value)} />
              <Select
                label="Emission Class"
                id="emissionClass"
                value={formData.emissionClass}
                onChange={(e) => updateField('emissionClass', e.target.value)}
                options={[{ value: '', label: 'Select' }, ...EMISSION_CLASSES.map((e) => ({ value: e, label: e }))]}
              />
              <Input label="Axles" id="axles" type="number" placeholder="e.g., 2" value={formData.axles} onChange={(e) => updateField('axles', e.target.value)} />
              <Input label="Weight (kg)" id="weight" type="number" placeholder="e.g., 18000" value={formData.weight} onChange={(e) => updateField('weight', e.target.value)} />
              <Input label="Color" id="color" placeholder="e.g., White" value={formData.color} onChange={(e) => updateField('color', e.target.value)} />
              <Input label="VIN" id="vin" placeholder="Vehicle Identification Number" value={formData.vin} onChange={(e) => updateField('vin', e.target.value)} />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-5">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="City" id="city" placeholder="e.g., Amsterdam" value={formData.city} onChange={(e) => updateField('city', e.target.value)} />
              <Input label="Country" id="country" placeholder="e.g., Netherlands" value={formData.country} onChange={(e) => updateField('country', e.target.value)} />
              <Input label="Postal Code" id="postalCode" placeholder="e.g., 1012" value={formData.postalCode} onChange={(e) => updateField('postalCode', e.target.value)} />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-5">Images</h2>
            <ImageUpload images={images} onImagesChange={setImages} maxImages={20} />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" variant="accent" size="lg" loading={loading} className="gap-2">
              <Save className="w-4 h-4" /> Publish Listing
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
