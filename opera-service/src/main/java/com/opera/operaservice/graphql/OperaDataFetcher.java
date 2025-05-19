package com.opera.operaservice.graphql;

import com.netflix.graphql.dgs.*;
import com.opera.operaservice.dto.*;
import com.opera.operaservice.model.Opera;
import com.opera.operaservice.service.OperaService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@DgsComponent
public class OperaDataFetcher {

    private final OperaService operaService;

    @Autowired
    public OperaDataFetcher(OperaService operaService) {
        this.operaService = operaService;
    }


    @DgsQuery
    public List<OperaDTO> operas() {
        return operaService.findAll().stream()
                .map(operaService::findOperaWithDetails)
                .collect(Collectors.toList());
    }

    @DgsQuery
    public OperaDTO opera(@InputArgument("id") String id) {
        return operaService.findOperaWithDetails(UUID.fromString(id));
    }

    @DgsQuery
    public List<OperaDTO> operasByComposer(@InputArgument("composer") String composer) {
        return operaService.findByComposer(composer).stream()
                .map(operaService::findOperaWithDetails)
                .collect(Collectors.toList());
    }

    @DgsQuery
    public List<OperaDTO> operasByYearRange(
            @InputArgument("startYear") int startYear,
            @InputArgument("endYear") int endYear) {
        return operaService.findByPremiereYearBetween(startYear, endYear).stream()
                .map(operaService::findOperaWithDetails)
                .collect(Collectors.toList());
    }

    @DgsMutation
    public OperaDTO createOpera(@InputArgument("operaInput") OperaInput input) {
        OperaDTO dto = new OperaDTO();
        dto.setTitle(input.getTitle());
        dto.setDescription(input.getDescription());
        dto.setPremiereYear(input.getPremiereYear());
        dto.setComposer(input.getComposer());
        dto.setLibrettist(input.getLibrettist());
        dto.setLanguage(input.getLanguage());
        
        return operaService.createOpera(dto);
    }

    @DgsMutation
    public OperaDTO updateOpera(
            @InputArgument("id") String id,
            @InputArgument("operaInput") OperaInput input) {
        
        OperaDTO dto = new OperaDTO();
        dto.setId(UUID.fromString(id));
        dto.setTitle(input.getTitle());
        dto.setDescription(input.getDescription());
        dto.setPremiereYear(input.getPremiereYear());
        dto.setComposer(input.getComposer());
        dto.setLibrettist(input.getLibrettist());
        dto.setLanguage(input.getLanguage());
        
        return operaService.updateOpera(UUID.fromString(id), dto);
    }

    @DgsMutation
    public Boolean deleteOpera(@InputArgument("id") String id) {
        operaService.deleteById(UUID.fromString(id));
        return true;
    }

    @DgsData(parentType = "Opera", field = "shows")
    public List<ShowDTO> showsForOpera(DgsDataFetchingEnvironment dfe) {
        // This will be resolved by the Apollo Gateway
        // The actual data will be fetched from the shows-service
        return null;
    }

    @DgsEntityFetcher(name = "Opera")
    public OperaDTO resolveOperaReference(java.util.Map<String, Object> reference) {
        if (reference.get("id") instanceof String) {
            String id = (String) reference.get("id");
            return operaService.findOperaWithDetails(UUID.fromString(id));
        }
        return null;
    }
}
