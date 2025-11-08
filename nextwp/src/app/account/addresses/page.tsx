"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Home, 
  Building, 
  Briefcase,
  Star,
  CheckCircle,
  Phone,
  Mail,
  User
} from "lucide-react";
import UserSidebar from "@/components/UserSidebar";

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      type: "home",
      isDefault: true,
      firstName: "John",
      lastName: "Doe",
      company: "",
      address1: "123 Main Street",
      address2: "Apt 4B",
      city: "New York",
      state: "NY",
      postcode: "10001",
      country: "US",
      phone: "+1 (555) 123-4567",
      email: "john.doe@example.com"
    },
    {
      id: "2",
      type: "work",
      isDefault: false,
      firstName: "John",
      lastName: "Doe",
      company: "Acme Inc.",
      address1: "456 Business Ave",
      address2: "Suite 100",
      city: "New York",
      state: "NY",
      postcode: "10005",
      country: "US",
      phone: "+1 (555) 987-6543",
      email: "john.doe@acme.com"
    },
    {
      id: "3",
      type: "other",
      isDefault: false,
      firstName: "Jane",
      lastName: "Doe",
      company: "",
      address1: "789 Family Lane",
      address2: "",
      city: "Brooklyn",
      state: "NY",
      postcode: "11201",
      country: "US",
      phone: "+1 (555) 456-7890",
      email: "jane.doe@example.com"
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    type: 'home',
    isDefault: false,
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'US',
    phone: '',
    email: ''
  });

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="h-5 w-5" />;
      case 'work': return <Briefcase className="h-5 w-5" />;
      default: return <Building className="h-5 w-5" />;
    }
  };

  const getAddressTypeText = (type: string) => {
    switch (type) {
      case 'home': return 'Home';
      case 'work': return 'Work';
      default: return 'Other';
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.firstName || !newAddress.lastName || !newAddress.address1 || !newAddress.city) {
      alert('Please fill in all required fields');
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      type: newAddress.type || 'home',
      isDefault: addresses.length === 0 || newAddress.isDefault || false,
      firstName: newAddress.firstName || '',
      lastName: newAddress.lastName || '',
      company: newAddress.company || '',
      address1: newAddress.address1 || '',
      address2: newAddress.address2 || '',
      city: newAddress.city || '',
      state: newAddress.state || '',
      postcode: newAddress.postcode || '',
      country: newAddress.country || 'US',
      phone: newAddress.phone || '',
      email: newAddress.email || ''
    };

    // If this is set as default, remove default from other addresses
    let updatedAddresses = [...addresses];
    if (address.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
    }

    setAddresses([...updatedAddresses, address]);
    setNewAddress({
      type: 'home',
      isDefault: false,
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'US',
      phone: '',
      email: ''
    });
    setIsAddDialogOpen(false);
  };

  const handleEditAddress = () => {
    if (!editingAddress) return;

    const updatedAddresses = addresses.map(addr => {
      if (addr.id === editingAddress.id) {
        return editingAddress;
      }
      // If this address is set as default, remove default from other addresses
      if (editingAddress.isDefault) {
        return { ...addr, isDefault: false };
      }
      return addr;
    });

    setAddresses(updatedAddresses);
    setIsEditDialogOpen(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (addressId: string) => {
    const addressToDelete = addresses.find(addr => addr.id === addressId);
    if (!addressToDelete) return;

    // Can't delete default address if it's the only one
    if (addressToDelete.isDefault && addresses.length > 1) {
      alert('Cannot delete default address. Please set another address as default first.');
      return;
    }

    // If deleting default address, make another one default
    let updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    if (addressToDelete.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    setAddresses(updatedAddresses);
  };

  const handleSetDefault = (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    setAddresses(updatedAddresses);
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <UserSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Addresses</h1>
                  <p className="text-gray-600">
                    Manage your shipping and billing addresses
                  </p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="addType">Address Type</Label>
                        <Select 
                          value={newAddress.type} 
                          onValueChange={(value: 'home' | 'work' | 'other') => 
                            setNewAddress(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="work">Work</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="addFirstName">First Name *</Label>
                        <Input
                          id="addFirstName"
                          value={newAddress.firstName || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addLastName">Last Name *</Label>
                        <Input
                          id="addLastName"
                          value={newAddress.lastName || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addCompany">Company (Optional)</Label>
                        <Input
                          id="addCompany"
                          value={newAddress.company || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Acme Inc."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="addAddress1">Address *</Label>
                        <Input
                          id="addAddress1"
                          value={newAddress.address1 || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, address1: e.target.value }))}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="addAddress2">Apartment, suite, etc. (Optional)</Label>
                        <Input
                          id="addAddress2"
                          value={newAddress.address2 || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, address2: e.target.value }))}
                          placeholder="Apt 4B"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addCity">City *</Label>
                        <Input
                          id="addCity"
                          value={newAddress.city || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addState">State/Province *</Label>
                        <Input
                          id="addState"
                          value={newAddress.state || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="NY"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addPostcode">ZIP/Postal Code *</Label>
                        <Input
                          id="addPostcode"
                          value={newAddress.postcode || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, postcode: e.target.value }))}
                          placeholder="10001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addCountry">Country</Label>
                        <Select 
                          value={newAddress.country} 
                          onValueChange={(value) => setNewAddress(prev => ({ ...prev, country: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="addPhone">Phone *</Label>
                        <Input
                          id="addPhone"
                          value={newAddress.phone || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addEmail">Email *</Label>
                        <Input
                          id="addEmail"
                          type="email"
                          value={newAddress.email || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john.doe@example.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="addDefault"
                            checked={newAddress.isDefault}
                            onCheckedChange={(checked) => setNewAddress(prev => ({ ...prev, isDefault: checked as boolean }))}
                          />
                          <Label htmlFor="addDefault">Set as default address</Label>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddAddress} className="bg-purple-600 hover:bg-purple-700">
                        Add Address
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Addresses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addresses.map((address) => (
                <Card key={address.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Address Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          {getAddressIcon(address.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{getAddressTypeText(address.type)}</h3>
                          {address.isDefault && (
                            <Badge className="bg-green-100 text-green-800">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(address)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          disabled={address.isDefault && addresses.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Address Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          <span className="font-medium">{address.firstName} {address.lastName}</span>
                        </span>
                      </div>
                      {address.company && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{address.company}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div className="text-sm">
                          <span>{address.address1}</span>
                          {address.address2 && <><br /><span>{address.address2}</span></>}
                          <br />
                          <span>{address.city}, {address.state} {address.postcode}</span>
                          <br />
                          <span>{address.country}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{address.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{address.email}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleSetDefault(address.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Set Default
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(address)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Address Card */}
            <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold mb-2">Add New Address</h3>
                <p className="text-gray-600 mb-4">Save a new address for faster checkout</p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Add Address
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Address Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          {editingAddress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editType">Address Type</Label>
                <Select 
                  value={editingAddress.type} 
                  onValueChange={(value: 'home' | 'work' | 'other') => 
                    setEditingAddress(prev => prev ? { ...prev, type: value } : prev)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editFirstName">First Name *</Label>
                <Input
                  id="editFirstName"
                  value={editingAddress.firstName}
                  onChange={(e) => setEditingAddress(prev => prev ? { ...prev, firstName: e.target.value } : prev)}
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name *</Label>
                <Input
                  id="editLastName"
                  value={editingAddress.lastName}
                  onChange={(e) => setEditingAddress(prev => prev ? { ...prev, lastName: e.target.value } : prev)}
                />
              </div>
              <div>
                <Label htmlFor="editCompany">Company (Optional)</Label>
                <Input
                  id="editCompany"
                  value={editingAddress.company}
                  onChange={(e) => setEditingAddress(prev => prev ? { ...prev, company: e.target.value } : prev)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="editAddress1">Address *</Label>
                <Input
                  id="editAddress1"
                  value={editingAddress.address1}
                  onChange={(e) => setEditingAddress(prev => prev ? { ...prev, address1: e.target.value } : prev)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="editAddress2">Apartment, suite, etc. (Optional)</Label>
                <Input
                  id="editAddress2"
                  value={editingAddress.address2}
                  onChange={(e) => setEditingAddress(prev => prev ? { ...prev, address2: e.target.value } : prev)}
                />
              </div>
              <div>
                <Label htmlFor="editCity">City *</Label>
                <Input
                  id="editCity"
                  value={editingAddress.city}
                  onChange={(e) => setEditingAddress(prev => prev ? { ...prev, city: e.target.value } : prev)}
                />
              </div>
              <div>
                <Label htmlFor="editState">State/Province *</Label>
                <Input
                  id="editState"
                  value={editingAddress.state}
                  onChange={(e) => setEditingAddress(prev => prev ? { ...prev, state: e.target.value } : prev)}
                />
              </div>
              <div>
                <Label htmlFor="editPostcode">ZIP/Postal Code *</Label>
                <Input
                  id="editPostcode"
                  value={editingAddress.postcode}
                  onChange={(e) => setEditingAddress(prev => prev ? { ...prev, postcode: e.target.value } : prev)}
                />
              </div>
              <div>
                <Label htmlFor="editCountry">Country</Label>
                <Select 
                  value={editingAddress.country} 
                  onValueChange={(value) => setEditingAddress(prev => prev ? { ...prev, country: value } : prev)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editPhone">Phone *</Label>
                <Input
                  id="editPhone"
                  value={editingAddress.phone}
                  onChange={(e) => setEditingAddress(prev => prev ? { ...prev, phone: e.target.value } : prev)}
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email *</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingAddress.email}
                  onChange={(e) => setEditingAddress(prev => prev ? { ...prev, email: e.target.value } : prev)}
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="editDefault"
                    checked={editingAddress.isDefault}
                    onCheckedChange={(checked) => setEditingAddress(prev => prev ? { ...prev, isDefault: checked as boolean } : prev)}
                  />
                  <Label htmlFor="editDefault">Set as default address</Label>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAddress} className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}