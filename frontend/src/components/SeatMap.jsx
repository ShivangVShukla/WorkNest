import React, { useState } from "react";

function SeatMap({ desks, selectedDeskId, onSelectDesk, baseDayPrice, baseMonthPrice, plan }) {
    const [hoveredDesk, setHoveredDesk] = useState(null);

    if (!desks || desks.length === 0) {
        return (
            <div className="seat-map-empty">
                <p>Loading real-time interactive floor plan...</p>
            </div>
        );
    }

    // Determine grid rows and cols
    const rows = Array.from(new Set(desks.map((d) => d.rowNumber))).sort((a, b) => a - b);
    const cols = Array.from(new Set(desks.map((d) => d.colNumber))).sort((a, b) => a - b);

    const getDeskPrice = (desk) => {
        const multiplier = desk.deskType === "CABIN" ? 1.5 : 1.0;
        if (plan === "DAY") {
            return `₹${Math.round(baseDayPrice * multiplier)} / day`;
        }
        return `₹${Math.round(baseMonthPrice * multiplier)} / mo`;
    };

    return (
        <div className="seat-map-container">
            <div className="seat-map-header">
                <div className="seat-map-title">
                    <span className="live-pulse"></span>
                    <strong>Interactive Floor Layout & Real-Time Seat Map</strong>
                </div>
                <div className="seat-map-legend">
                    <div className="legend-item">
                        <span className="legend-dot available"></span> Available Desk
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot cabin-available"></span> Available Cabin
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot selected"></span> Selected
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot booked"></span> Booked
                    </div>
                </div>
            </div>

            <div className="seat-map-stage">
                <div className="floor-entrance">
                    <span>MAIN ENTRANCE / RECEPTION ⤹</span>
                </div>

                <div className="seat-grid-layout">
                    {rows.map((rowNum) => {
                        const isCabinRow = rowNum === 3;
                        return (
                            <div key={rowNum} className="seat-row-wrapper">
                                <div className="row-indicator">
                                    {isCabinRow ? "Private Cabins" : `Work Bay ${rowNum}`}
                                </div>
                                <div className="seat-row">
                                    {cols.map((colNum) => {
                                        const desk = desks.find(
                                            (d) => d.rowNumber === rowNum && d.colNumber === colNum
                                        );
                                        if (!desk) return <div key={colNum} className="seat-slot empty" />;

                                        const isSelected = selectedDeskId === desk.id;
                                        const isAvailable = desk.available;
                                        const isCabin = desk.deskType === "CABIN";

                                        let seatClass = "seat-slot";
                                        if (isCabin) seatClass += " cabin-slot";
                                        if (isSelected) seatClass += " is-selected";
                                        else if (!isAvailable) seatClass += " is-booked";
                                        else seatClass += isCabin ? " is-cabin-available" : " is-available";

                                        return (
                                            <div
                                                key={desk.id}
                                                className={seatClass}
                                                onClick={() => {
                                                    if (isAvailable) {
                                                        onSelectDesk(desk);
                                                    }
                                                }}
                                                onMouseEnter={() => setHoveredDesk(desk)}
                                                onMouseLeave={() => setHoveredDesk(null)}
                                                title={`${desk.deskCode} - ${isAvailable ? "Available" : "Occupied"}`}
                                            >
                                                <div className="seat-icon">
                                                    {isCabin ? "🏛️" : "🪑"}
                                                </div>
                                                <span className="seat-code">{desk.deskCode}</span>
                                                <span className="seat-badge">
                                                    {isCabin ? `${desk.capacity || 4}p Cabin` : "Flex Desk"}
                                                </span>
                                                {!isAvailable && (
                                                    <span className="seat-status-tag">Booked</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {hoveredDesk && (
                <div className="seat-hover-panel">
                    <div className="hover-info">
                        <strong>{hoveredDesk.deskCode}</strong>
                        <span>Type: {hoveredDesk.deskType === "CABIN" ? "Executive Cabin (4-6 Persons)" : "Ergonomic Focus Desk"}</span>
                        <span>Capacity: {hoveredDesk.capacity || 1} Person(s)</span>
                        <span>Rate: {getDeskPrice(hoveredDesk)}</span>
                    </div>
                    <div className="hover-status">
                        {hoveredDesk.available ? (
                            <span className="badge-free">Available for selected dates</span>
                        ) : (
                            <span className="badge-busy">Occupied by {hoveredDesk.bookedBy || "Member"}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SeatMap;
