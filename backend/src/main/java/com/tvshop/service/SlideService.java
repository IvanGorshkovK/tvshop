package com.tvshop.service;

import com.tvshop.domain.Slide;
import com.tvshop.exception.NotFoundException;
import com.tvshop.repository.SlideRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SlideService {

    private final SlideRepository repository;

    public SlideService(SlideRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Slide> list() {
        return repository.findAllByOrderByPositionAscIdAsc();
    }

    @Transactional
    public Slide create(Slide slide) {
        if (slide.getPosition() == null) {
            List<Slide> all = repository.findAllByOrderByPositionAscIdAsc();
            slide.setPosition(all.isEmpty() ? 0 : all.get(all.size() - 1).getPosition() + 1);
        }
        return repository.save(slide);
    }

    @Transactional
    public Slide update(Long id, Slide data) {
        Slide s = repository.findById(id).orElseThrow(() -> new NotFoundException("Слайд не найден"));
        s.setTag(data.getTag());
        s.setTitle(data.getTitle());
        s.setText(data.getText());
        s.setIcon(data.getIcon());
        s.setLink(data.getLink());
        s.setImage(data.getImage());
        if (data.getPosition() != null) s.setPosition(data.getPosition());
        return repository.save(s);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Слайд не найден");
        }
        repository.deleteById(id);
    }
}
