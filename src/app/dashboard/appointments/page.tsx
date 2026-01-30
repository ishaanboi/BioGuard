"use client";

import { useState } from "react";
import { Search, MapPin, Star, Calendar, Phone, Globe, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapView } from "@/components/dashboard/map-view";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default function AppointmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [doctors, setDoctors] = useState<any[]>([]);

    // Booking Modal State
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [doctorDetails, setDoctorDetails] = useState<any>(null);

    // Initial Mock Data (fallback)
    const mockDoctors = [
        {
            id: 'mock1',
            name: "Dr. Sarah Johnson",
            specialty: "Cardiologist",
            hospital: "Heart Care Institute",
            rating: 4.9,
            reviews: 124,
            distance: "1.2 km",
            available: true,
        },
        // ... can add more mocks if map fails
    ];

    const displayDoctors = doctors.length > 0 ? doctors : mockDoctors;

    const filteredDoctors = displayDoctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.specialty && doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doctor.hospital && doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleBook = (doctor: any) => {
        setSelectedDoctor(doctor);
        setIsBookingOpen(true);
        setIsLoadingDetails(true);
        setDoctorDetails(null);

        if (!doctor.id || doctor.id.startsWith('mock')) {
            setDoctorDetails({
                phone: "555-0123", // Mock phone
                formattedPhone: "(555) 0123",
                url: null,
                name: doctor.name
            });
            setIsLoadingDetails(false);
            return;
        }

        if (!window.google) {
            toast.error("Google Maps service not ready.");
            setIsBookingOpen(false);
            return;
        }

        const mapDiv = document.createElement('div');
        const service = new window.google.maps.places.PlacesService(mapDiv);

        const request = {
            placeId: doctor.id,
            fields: ['formatted_phone_number', 'international_phone_number', 'name', 'url', 'website']
        };

        service.getDetails(request, (place, status) => {
            setIsLoadingDetails(false);
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                setDoctorDetails({
                    phone: place.international_phone_number || place.formatted_phone_number,
                    formattedPhone: place.formatted_phone_number || place.international_phone_number,
                    url: place.url,
                    website: place.website,
                    name: place.name
                });
            } else {
                toast.error("Could not fetch details.");
                // Fallback to basic info
                setDoctorDetails({
                    name: doctor.name,
                    phone: null
                });
            }
        });
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-headline font-bold text-white mb-2">Book an Appointment</h1>
                <p className="text-blue-200/60">Find the best specialists near you.</p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/50 w-5 h-5" />
                <Input
                    placeholder="Search doctors, specialties, or clinics..."
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-500/50 focus:bg-white/10 rounded-xl h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Main Content: Split View */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

                {/* Left: Doctor List */}
                <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4 max-h-[calc(100vh-250px)] scrollbar-hide">
                    {doctors.length === 0 && (
                        <div className="text-center py-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-200 text-sm mb-4">
                            Enable location on the map to see real doctors nearby!
                        </div>
                    )}

                    {filteredDoctors.map((doctor) => (
                        <Card key={doctor.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group">
                            <CardContent className="p-4 flex gap-4">
                                <Avatar className="h-16 w-16 rounded-xl border border-white/10">
                                    <AvatarImage src={doctor.image} />
                                    <AvatarFallback className="bg-blue-600/20 text-blue-300 font-bold rounded-xl text-lg">
                                        {doctor.name.split(' ')[1] ? doctor.name.split(' ')[1][0] : doctor.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm">{doctor.name}</h3>
                                            <p className="text-xs text-blue-200/70">{doctor.specialty}</p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded text-yellow-400 text-xs font-bold">
                                            <Star className="w-3 h-3 fill-current" />
                                            {doctor.rating ? doctor.rating : 'N/A'}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-blue-200/40 mt-1 mb-3">
                                        <MapPin className="w-3 h-3" />
                                        <span className="line-clamp-1">{doctor.hospital}</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        {doctor.available ? (
                                            <Badge variant="outline" className="text-green-400 border-green-400/20 bg-green-400/10 text-[10px]">
                                                Open Now
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-red-400 border-red-400/20 bg-red-400/10 text-[10px]">
                                                Closed
                                            </Badge>
                                        )}
                                        <Button
                                            size="sm"
                                            className="h-8 bg-blue-600 hover:bg-blue-500 text-xs gap-1"
                                            onClick={() => handleBook(doctor)}
                                        >
                                            <Calendar className="w-3 h-3" />
                                            Book
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Right: Map View */}
                <div className="lg:col-span-2 bg-[#0f172a] rounded-2xl border border-white/10 relative overflow-hidden group min-h-[400px]">
                    <MapView onDoctorsFound={setDoctors} />
                </div>

            </div>

            {/* Booking Modal */}
            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                <DialogContent className="bg-[#0f172a] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-headline font-bold text-white flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-blue-500" />
                            Book Appointment
                        </DialogTitle>
                        <DialogDescription className="text-blue-200/60">
                            Contact {selectedDoctor?.name} directly to schedule your visit.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 space-y-4">
                        {isLoadingDetails ? (
                            <div className="flex flex-col items-center justify-center py-8 text-blue-200/50">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <p>Fetching contact details...</p>
                            </div>
                        ) : !doctorDetails?.phone ? (
                            <div className="text-center py-6 bg-red-500/10 rounded-xl border border-red-500/20">
                                <p className="text-red-300 font-bold mb-1">No Phone Number Available</p>
                                <p className="text-xs text-red-200/60">This location has not listed a contact number.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <label className="text-xs font-bold text-blue-200/40 uppercase tracking-wider mb-1.5 block">Contact Number</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-mono text-white">{doctorDetails.formattedPhone}</span>
                                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Verified</Badge>
                                    </div>
                                </div>
                                <p className="text-xs text-center text-blue-200/40">
                                    Mention "BioGuard" when booking for priority service.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-between gap-2">
                        {doctorDetails?.url && (
                            <Button variant="outline" className="border-white/10 text-blue-200 hover:bg-white/5 hover:text-white flex-1" onClick={() => window.open(doctorDetails.url, '_blank')}>
                                <Globe className="w-4 h-4 mr-2" />
                                View Map
                            </Button>
                        )}

                        {doctorDetails?.phone && (
                            <Button className="bg-blue-600 hover:bg-blue-500 flex-1" onClick={() => window.location.href = `tel:${doctorDetails.phone}`}>
                                <Phone className="w-4 h-4 mr-2" />
                                Call Now
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
