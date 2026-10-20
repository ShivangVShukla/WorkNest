
package com.coworking.controller;

import com.coworking.entity.Space;
import com.coworking.service.SpaceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import java.util.List;

@RestController
@RequestMapping("/api/spaces")
public class SpaceController {

    private final SpaceService spaceService;

    public SpaceController(SpaceService spaceService) {
        this.spaceService = spaceService;
    }

    @PostMapping
    public ResponseEntity<Space> createSpace(@RequestBody Space space) {
        Space createdSpace = spaceService.createSpace(space);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSpace);
    }

    @GetMapping
    public ResponseEntity<List<Space>> getAllSpaces() {
        return ResponseEntity.ok(spaceService.getAllSpaces());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Space> getSpaceById(@PathVariable Long id) {
        return spaceService.getSpaceById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Space> updateSpace(
            @PathVariable Long id,
            @RequestBody Space space) {
        return ResponseEntity.ok(spaceService.updateSpace(id, space));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpace(@PathVariable Long id) {
        spaceService.deleteSpace(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/availability")
    public List<Space> getAvailableSpaces(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            @RequestParam(required = false)
            String spaceType) {

        return spaceService.getAvailableSpaces(
                startDate, endDate, spaceType);
    }

}
