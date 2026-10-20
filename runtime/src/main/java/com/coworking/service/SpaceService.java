
package com.coworking.service;

import com.coworking.entity.Space;
import com.coworking.repository.SpaceRepository;
import com.coworking.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SpaceService {

    private final SpaceRepository spaceRepository;
    private final BookingRepository bookingRepository;

    public SpaceService(
            SpaceRepository spaceRepository,
            BookingRepository bookingRepository) {
        this.spaceRepository = spaceRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Space> getAvailableSpaces(
            LocalDate startDate,
            LocalDate endDate,
            String spaceType) {

        if (startDate == null || endDate == null
                || !endDate.isAfter(startDate)
                || startDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid booking dates");
        }

        List<Space> spaces = spaceRepository.findAll();

        return spaces.stream()
                .filter(Space::isActive)
                .filter(space -> spaceType == null
                        || spaceType.isBlank()
                        || space.getSpaceType() != null
                        && space.getSpaceType().equalsIgnoreCase(spaceType))
                .filter(space -> !bookingRepository.existsConfirmedBookingOverlap(
                        space.getId(), startDate, endDate))
                .toList();
    }

    public Space createSpace(Space space) {
        return spaceRepository.save(space);
    }

    public List<Space> getAllSpaces() {
        return spaceRepository.findAll();
    }

    public Optional<Space> getSpaceById(Long id) {
        return spaceRepository.findById(id);
    }

    public Space updateSpace(Long id, Space updatedSpace) {
        Space space = spaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Space not found"));

        space.setName(updatedSpace.getName());
        space.setLocation(updatedSpace.getLocation());
        space.setDescription(updatedSpace.getDescription());
        space.setSpaceType(updatedSpace.getSpaceType());
        space.setPricePerDay(updatedSpace.getPricePerDay());
        space.setPricePerMonth(updatedSpace.getPricePerMonth());
        space.setActive(updatedSpace.isActive());

        return spaceRepository.save(space);
    }

    public void deleteSpace(Long id) {
        if (!spaceRepository.existsById(id)) {
            throw new RuntimeException("Space not found");
        }

        spaceRepository.deleteById(id);
    }
}
